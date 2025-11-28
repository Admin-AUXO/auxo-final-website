/**
 * Toast Notifications using Notyf
 * Beautiful notification system for user feedback
 */

import { Notyf } from 'notyf';

let notyf: Notyf | null = null;

/**
 * Initialize Notyf toast notifications
 */
export function initNotifications() {
  if (notyf) return notyf;

  notyf = new Notyf({
    duration: 4000,
    position: {
      x: 'right',
      y: 'bottom',
    },
    dismissible: true,
    ripple: true,
    types: [
      {
        type: 'success',
        background: '#A3E635', // accent-green
        icon: {
          className: 'notyf__icon--success',
          tagName: 'i',
        },
      },
      {
        type: 'error',
        background: '#EF4444', // red-500
        icon: {
          className: 'notyf__icon--error',
          tagName: 'i',
        },
      },
      {
        type: 'warning',
        background: '#F59E0B', // amber-500
        icon: false,
      },
      {
        type: 'info',
        background: '#3B82F6', // blue-500
        icon: false,
      },
    ],
  });

  console.log('✓ Notifications initialized');
  return notyf;
}

/**
 * Show success notification
 */
export function showSuccess(message: string) {
  const notyfInstance = notyf || initNotifications();
  notyfInstance.success(message);
}

/**
 * Show error notification
 */
export function showError(message: string) {
  const notyfInstance = notyf || initNotifications();
  notyfInstance.error(message);
}

/**
 * Show warning notification
 */
export function showWarning(message: string) {
  const notyfInstance = notyf || initNotifications();
  notyfInstance.open({
    type: 'warning',
    message: message,
  });
}

/**
 * Show info notification
 */
export function showInfo(message: string) {
  const notyfInstance = notyf || initNotifications();
  notyfInstance.open({
    type: 'info',
    message: message,
  });
}

/**
 * Dismiss all notifications
 */
export function dismissAll() {
  notyf?.dismissAll();
}
