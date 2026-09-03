const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
  return data;
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar usuarios');
  }
  return data;
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE}/users`, {
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
  const res = await fetch(`${API_BASE}/users/${username}/status`, {
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

export async function resetPassword(username) {
  const res = await fetch(`${API_BASE}/users/${username}/reset-password`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al restablecer contraseña');
  }
  return data;
}

export async function deleteUser(username) {
  const res = await fetch(`${API_BASE}/users/${username}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al eliminar usuario');
  }
  return data;
}

export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar configuraciones');
  }
  return data;
}

export async function saveSettings(settingsData) {
  const res = await fetch(`${API_BASE}/settings`, {
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
  const res = await fetch(`${API_BASE}/test-email`, {
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

export async function saveRecord(recordData) {
  const res = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al guardar registro');
  }
  return data;
}

export async function getRecords(username = null) {
  const url = username ? `${API_BASE}/records?username=${encodeURIComponent(username)}` : `${API_BASE}/records`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error al cargar historial de registros');
  }
  return data;
}

export function downloadRecordsExcel(username = null, recordId = null) {
  let url = `${API_BASE}/records/export/excel`;
  const params = new URLSearchParams();
  if (recordId) params.append('record_id', recordId);
  if (username) params.append('username', username);
  if (params.toString()) url += `?${params.toString()}`;
  window.open(url, '_blank');
}

export function openRecordPdf(recordId, autoPrint = false) {
  const url = `${API_BASE}/records/${recordId}/pdf${autoPrint ? '?print=true' : ''}`;
  window.open(url, '_blank');
}

export async function resendRecordEmail(recordId, recipientEmail) {
  const res = await fetch(`${API_BASE}/records/${recordId}/resend`, {
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
