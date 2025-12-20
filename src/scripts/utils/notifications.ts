import { Notyf } from 'notyf';

let notyf: Notyf | null = null;

export function initNotifications() {
  if (notyf) return notyf;

  // Get colors from CSS custom properties (best practice)
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const accentGreen = computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
  const errorColor = computedStyle.getPropertyValue('--error-color')?.trim() || '#EF4444';
  const warningColor = computedStyle.getPropertyValue('--warning-color')?.trim() || '#F59E0B';
  const infoColor = computedStyle.getPropertyValue('--info-color')?.trim() || '#3B82F6';

  notyf = new Notyf({
    duration: 4000,
    position: { x: 'right', y: 'bottom' },
    dismissible: true,
    ripple: true,
    types: [
      {
        type: 'success',
        background: accentGreen,
        icon: { className: 'notyf__icon--success', tagName: 'i' },
      },
      {
        type: 'error',
        background: errorColor,
        icon: { className: 'notyf__icon--error', tagName: 'i' },
      },
      { type: 'warning', background: warningColor, icon: false },
      { type: 'info', background: infoColor, icon: false },
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
