type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig {
  message: string;
  type: NotificationType;
  duration?: number;
}

const DEFAULT_DURATION = 4000;
const activeNotifications: Set<HTMLElement> = new Set();

let cachedNotificationStyles: Record<NotificationType, string> | null = null;

function getNotificationStyles(type: NotificationType): string {
  if (cachedNotificationStyles) {
    return cachedNotificationStyles[type];
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  cachedNotificationStyles = {
    success: computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635',
    error: computedStyle.getPropertyValue('--error-color')?.trim() || '#EF4444',
    warning: computedStyle.getPropertyValue('--warning-color')?.trim() || '#F59E0B',
    info: computedStyle.getPropertyValue('--info-color')?.trim() || '#3B82F6',
  };

  return cachedNotificationStyles[type];
}

function createNotificationElement(config: NotificationConfig): HTMLElement {
  const toast = document.createElement('div');
  const backgroundColor = getNotificationStyles(config.type);

  toast.className = `
    fixed bottom-6 right-6 z-[200]
    min-w-[280px] max-w-[400px]
    px-6 py-4 rounded-lg shadow-xl
    text-white font-medium text-base
    transform translate-x-[500px]
    transition-all duration-300 ease-out
    cursor-pointer
  `.trim().replace(/\s+/g, ' ');

  toast.style.backgroundColor = backgroundColor;
  toast.textContent = config.message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const closeButton = document.createElement('button');
  closeButton.className = 'ml-3 opacity-70 hover:opacity-100 transition-opacity';
  closeButton.textContent = '×';
  closeButton.style.cssText = 'float: right; font-size: 24px; line-height: 1; background: none; border: none; color: white; cursor: pointer; padding: 0; margin: -4px 0 0 12px;';
  closeButton.setAttribute('aria-label', 'Close notification');

  toast.appendChild(closeButton);

  return toast;
}

function showNotification(config: NotificationConfig): void {
  const toast = createNotificationElement(config);
  const duration = config.duration ?? DEFAULT_DURATION;

  document.body.appendChild(toast);
  activeNotifications.add(toast);

  let offsetY = 24;
  activeNotifications.forEach(existing => {
    if (existing !== toast) {
      const currentBottom = parseInt(existing.style.bottom || '24px');
      const height = existing.offsetHeight;
      offsetY = currentBottom + height + 12;
    }
  });

  toast.style.bottom = `${offsetY}px`;

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  const removeToast = () => {
    toast.style.transform = 'translateX(500px)';
    toast.style.opacity = '0';

    setTimeout(() => {
      try {
        if (toast.parentNode && toast.parentNode.contains(toast)) {
          toast.parentNode.removeChild(toast);
        }
      } catch (e) {
      }
      activeNotifications.delete(toast);
      repositionNotifications();
    }, 300);
  };

  toast.addEventListener('click', removeToast);
  toast.querySelector('button')?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeToast();
  });

  setTimeout(removeToast, duration);
}

function repositionNotifications(): void {
  const notificationArray = Array.from(activeNotifications);
  const heights: number[] = [];
  notificationArray.forEach(toast => {
    heights.push(toast.offsetHeight);
  });

  let offsetY = 24;
  notificationArray.forEach((toast, index) => {
    toast.style.bottom = `${offsetY}px`;
    offsetY += heights[index] + 12;
  });
}

export function initNotifications() {
  return null;
}

export function showSuccess(message: string): void {
  showNotification({ message, type: 'success' });
}

export function showError(message: string): void {
  showNotification({ message, type: 'error' });
}

export function showWarning(message: string): void {
  showNotification({ message, type: 'warning' });
}

export function showInfo(message: string): void {
  showNotification({ message, type: 'info' });
}

export function dismissAll(): void {
  activeNotifications.forEach(toast => {
    toast.style.transform = 'translateX(500px)';
    toast.style.opacity = '0';

    setTimeout(() => {
      try {
        if (toast.parentNode && toast.parentNode.contains(toast)) {
          toast.parentNode.removeChild(toast);
        }
      } catch (e) {
      }
    }, 300);
  });

  activeNotifications.clear();
}
