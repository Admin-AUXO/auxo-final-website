const CALENDAR_URL = 'https://calendar.app.google/6jRXDXyftxSPkGKZ6';
const MODAL_ID = 'calendar-modal';
const IFRAME_ID = 'calendar-iframe';

const initializedButtons = new WeakSet<HTMLElement>();

function getModal(): HTMLElement | null {
  return document.getElementById(MODAL_ID);
}

function getIframe(): HTMLIFrameElement | null {
  return document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
}

function openCalendarModal(): void {
  const modal = getModal();
  if (!modal) {
    if (import.meta.env.DEV) {
      console.warn('Calendar modal not found');
    }
    return;
  }

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  const iframe = getIframe();
  if (iframe && !iframe.src) {
    iframe.src = CALENDAR_URL;
  }

  const closeButton = modal.querySelector('[data-calendar-close]') as HTMLElement;
  closeButton?.focus();
}

function closeCalendarModal(): void {
  const modal = getModal();
  if (!modal) return;

  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function setupModalCloseHandlers(): void {
  const modal = getModal();
  if (!modal) return;

  const overlay = modal.querySelector('.calendar-modal-overlay');
  const closeButton = modal.querySelector('[data-calendar-close]');

  const handleClose = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    closeCalendarModal();
  };

  overlay?.addEventListener('click', handleClose);
  closeButton?.addEventListener('click', handleClose);

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeCalendarModal();
    }
  };

  document.addEventListener('keydown', handleEscape);
}

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  const handleClick = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCalendarModal();
  };

  button.addEventListener('click', handleClick, { passive: false });
  
  if (button instanceof HTMLAnchorElement) {
    button.removeAttribute('href');
    button.removeAttribute('target');
    button.setAttribute('role', 'button');
  }

  if (!button.hasAttribute('role')) {
    button.setAttribute('role', 'button');
  }
  button.setAttribute('tabindex', '0');
  
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  });

  initializedButtons.add(button);
}

function setupCalendarButtons(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const buttons = document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
  buttons.forEach((button) => {
    if (!initializedButtons.has(button)) {
      setupCalendarButton(button);
    }
  });

  const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="calendar.app.google"], a[href*="calendar.google.com"]');
  links.forEach((link) => {
    if (!link.hasAttribute('data-google-calendar-open') && !initializedButtons.has(link)) {
      link.setAttribute('data-google-calendar-open', '');
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.setAttribute('role', 'button');
      setupCalendarButton(link);
    }
  });
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  setupModalCloseHandlers();
  setupCalendarButtons();

  document.addEventListener('astro:page-load', () => {
    setTimeout(setupCalendarButtons, 100);
  }, { once: false });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCalendarButtons, { once: true });
  } else {
    setupCalendarButtons();
  }

  window.addEventListener('load', setupCalendarButtons, { once: true });
}

export function setupGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  try {
    initializeGoogleCalendar();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error setting up Google Calendar:', error);
    }
  }
}

export function openGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  openCalendarModal();
}
