/**
 * Web Notifications API service for LNet
 * Handles device notification permissions and dispatching native system alerts
 */

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('Este dispositivo/navegador no soporta notificaciones nativas.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error al solicitar permiso de notificaciones:', err);
    return 'denied';
  }
}

export function showDeviceNotification(title, options = {}, onClickCallback = null) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const defaultOptions = {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      silent: false,
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    if (onClickCallback) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        onClickCallback();
        notification.close();
      };
    }

    return notification;
  } catch (err) {
    console.error('Error al emitir notificación en el dispositivo:', err);
    return null;
  }
}
