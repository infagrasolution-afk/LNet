const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'lnet_token';
const USER_KEY = 'lnet_user';
const OFFLINE_QUEUE_KEY = 'lnet_offline_records_queue';

// ==========================================
// TOKEN & SESSION MANAGEMENT
// ==========================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setSession(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Función base para peticiones HTTP con inyección automática de cabeceras Bearer JWT
 */
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Si el token expiró o es inválido, limpiar sesión y notificar
    clearSession();
    window.dispatchEvent(new CustomEvent('lnet-session-expired'));
  }

  return response;
}

// ==========================================
// AUTHENTICATION
// ==========================================

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al iniciar sesión');
  }

  if (data.access_token) {
    setSession(data.access_token, data.user);
  }
  return data;
}

export async function getCurrentUserProfile() {
  const token = getToken();
  if (!token) return null;

  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) {
    return null;
  }
  const user = await res.json();
  setSession(token, user);
  return user;
}

// ==========================================
// USER MANAGEMENT (ADMIN ONLY)
// ==========================================

export async function getUsers() {
  const res = await authFetch(`${API_BASE}/users`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar usuarios');
  }
  return data;
}

export async function createUser(userData) {
  const res = await authFetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al crear usuario');
  }
  return data;
}

export async function updateUserStatus(username, status) {
  const res = await authFetch(`${API_BASE}/users/${username}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al actualizar estado');
  }
  return data;
}

export async function updateUserRole(username, role) {
  const res = await authFetch(`${API_BASE}/users/${username}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al actualizar rol');
  }
  return data;
}

export async function resetPassword(username) {
  const res = await authFetch(`${API_BASE}/users/${username}/reset-password`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al restablecer contraseña');
  }
  return data;
}

export async function deleteUser(username) {
  const res = await authFetch(`${API_BASE}/users/${username}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al eliminar usuario');
  }
  return data;
}

// ==========================================
// SETTINGS & EMAIL (ADMIN ONLY)
// ==========================================

export async function getSettings() {
  const res = await authFetch(`${API_BASE}/settings`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar configuraciones');
  }
  return data;
}

export async function saveSettings(settingsData) {
  const res = await authFetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al guardar configuraciones');
  }
  return data;
}

export async function testEmailConnection(recipient) {
  const res = await authFetch(`${API_BASE}/test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al probar conexión de correo');
  }
  return data;
}

// ==========================================
// RECORDS & OFFLINE QUEUE RESILIENCE
// ==========================================

export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveToOfflineQueue(recordData) {
  try {
    const queue = getOfflineQueue();
    queue.push({
      id: `offline-${Date.now()}`,
      data: recordData,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('lnet-offline-queue-updated'));
  } catch (e) {
    console.error('Error guardando en cola offline:', e);
  }
}

export async function syncPendingOfflineRecords() {
  const queue = getOfflineQueue();
  if (!queue || queue.length === 0) return { synced: 0, failed: 0 };

  const remaining = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      const res = await authFetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      if (res.ok) {
        syncedCount++;
      } else {
        remaining.push(item);
      }
    } catch (err) {
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  window.dispatchEvent(new CustomEvent('lnet-offline-queue-updated'));
  return { synced: syncedCount, remaining: remaining.length };
}

// Escucha reconexión para sincronizar en segundo plano
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingOfflineRecords().then((res) => {
      if (res.synced > 0) {
        console.log(`[LNet Offline] ${res.synced} planilla(s) sincronizada(s) con éxito tras recuperar conexión.`);
      }
    });
  });
}

export async function saveRecord(recordData, files = []) {
  // Si no hay conexión de red, guardar en cola local
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    saveToOfflineQueue(recordData);
    return {
      offline: true,
      message: 'Sin conexión a internet. La planilla fue guardada en el dispositivo y se sincronizará automáticamente al volver a tener red.',
      record: recordData,
    };
  }

  let res;
  try {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(recordData));
      files.forEach((file) => {
        formData.append('files', file);
      });
      res = await authFetch(`${API_BASE}/records`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await authFetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Error al guardar registro');
    }
    return data;
  } catch (err) {
    // Si falló por error de red / corte inesperado
    if (err.message && (err.message.includes('fetch') || err.message.includes('NetworkError'))) {
      saveToOfflineQueue(recordData);
      return {
        offline: true,
        message: 'Conexión inestable detectada. La planilla fue guardada localmente y se subirá tan pronto regrese la red.',
        record: recordData,
      };
    }
    throw err;
  }
}

export function getAttachmentUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api')) {
    return API_BASE === '/api' ? path : `${API_BASE.replace(/\/api$/, '')}${path}`;
  }
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function getRecords(username = null, startDate = null, endDate = null) {
  const params = new URLSearchParams();
  if (username) params.append('username', username);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${API_BASE}/records${query}`;
  const res = await authFetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar historial de registros');
  }
  return data;
}

export function downloadRecordsExcel(username = null, recordId = null, startDate = null, endDate = null) {
  let url = `${API_BASE}/records/export/excel`;
  const params = new URLSearchParams();
  if (recordId) params.append('record_id', recordId);
  if (username) params.append('username', username);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (params.toString()) url += `?${params.toString()}`;
  window.open(url, '_blank');
}

export function downloadNetunoIndividualExcel(recordId) {
  const url = `${API_BASE}/records/${encodeURIComponent(recordId)}/export/netuno-individual`;
  window.open(url, '_blank');
}

export function downloadNetunoRelacionExcel(startDate = null, endDate = null, username = null) {
  let url = `${API_BASE}/records/export/netuno-relacion`;
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (username) params.append('username', username);
  if (params.toString()) url += `?${params.toString()}`;
  window.open(url, '_blank');
}

export function openRecordPdf(recordId, autoPrint = false) {
  const url = `${API_BASE}/records/${recordId}/pdf${autoPrint ? '?print=true' : ''}`;
  window.open(url, '_blank');
}


export async function resendRecordEmail(recordId, recipientEmail) {
  const res = await authFetch(`${API_BASE}/records/${recordId}/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient_email: recipientEmail }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al reenviar correo');
  }
  return data;
}

export async function getNotifications() {
  const res = await authFetch(`${API_BASE}/notifications`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar notificaciones');
  }
  return data;
}

export async function markNotificationsRead(username, notificationId = null, markAll = false) {
  const res = await authFetch(`${API_BASE}/notifications/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      notification_id: notificationId,
      mark_all: markAll,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al actualizar notificaciones');
  }
  return data;
}

export async function clearNotifications() {
  const res = await authFetch(`${API_BASE}/notifications`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al limpiar notificaciones');
  }
  return data;
}

// ==========================================
// INVENTARIO CENTRALIZADO
// ==========================================

export async function getInventory() {
  const res = await authFetch(`${API_BASE}/inventory`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar inventario');
  }
  return data;
}

export async function createInventoryItem(itemData) {
  const res = await authFetch(`${API_BASE}/inventory/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al crear producto en el inventario');
  }
  return data;
}

export async function updateInventoryItem(itemId, itemData) {
  const res = await authFetch(`${API_BASE}/inventory/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al actualizar producto');
  }
  return data;
}

export async function deleteInventoryItem(itemId) {
  const res = await authFetch(`${API_BASE}/inventory/items/${itemId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al eliminar producto');
  }
  return data;
}

export async function adjustInventoryStock(adjustData) {
  const res = await authFetch(`${API_BASE}/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al ajustar stock');
  }
  return data;
}

export async function getInventoryMovements(limit = 150) {
  const res = await authFetch(`${API_BASE}/inventory/movements?limit=${limit}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar movimientos de inventario');
  }
  return data;
}

// ==========================================
// RESPALDOS Y SEGURIDAD DEL SISTEMA
// ==========================================

export async function downloadFullSystemBackup() {
  const res = await authFetch(`${API_BASE}/system/backup/download`);
  if (!res.ok) throw new Error('Error al descargar copia de seguridad');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LNet_Backup_Completo_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadSqliteDatabase() {
  const res = await authFetch(`${API_BASE}/system/backup/download-db`);
  if (!res.ok) throw new Error('Error al descargar base de datos SQLite');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lnet_${new Date().toISOString().slice(0, 10)}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function restoreSystemBackup(backupJsonData) {
  const res = await authFetch(`${API_BASE}/system/backup/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backupJsonData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al restaurar respaldo');
  }
  return data;
}

