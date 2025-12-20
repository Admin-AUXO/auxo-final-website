import { Notyf } from 'notyf';

let notyf: Notyf | null = null;

export function initNotifications() {
  if (notyf) return notyf;

  notyf = new Notyf({
    duration: 4000,
    position: { x: 'right', y: 'bottom' },
    dismissible: true,
    ripple: true,
    types: [
      {
        type: 'success',
        background: '#A3E635',
        icon: { className: 'notyf__icon--success', tagName: 'i' },
      },
      {
        type: 'error',
        background: '#EF4444',
        icon: { className: 'notyf__icon--error', tagName: 'i' },
      },
      { type: 'warning', background: '#F59E0B', icon: false },
      { type: 'info', background: '#3B82F6', icon: false },
    ],
  });

  return notyf;
}

function getNotyfInstance(): Notyf {
  return notyf || initNotifications();
}

export function showSuccess(message: string) {
  getNotyfInstance().success(message);
}

export function showError(message: string) {
  getNotyfInstance().error(message);
}

export function showWarning(message: string) {
  getNotyfInstance().open({ type: 'warning', message });
}

export function showInfo(message: string) {
  getNotyfInstance().open({ type: 'info', message });
}

export function dismissAll() {
  notyf?.dismissAll();
}
