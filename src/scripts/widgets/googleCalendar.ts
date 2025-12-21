import { DragGesture } from '@use-gesture/vanilla';

const CALENDAR_URL = 'https://calendar.app.google/6jRXDXyftxSPkGKZ6';
const MODAL_ID = 'calendar-modal';
const IFRAME_ID = 'calendar-iframe';
const SCROLL_THRESHOLD = 50;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

const initializedButtons = new WeakSet<HTMLElement>();
let swipeGesture: DragGesture | null = null;

function getModal(): HTMLElement | null {
  return document.getElementById(MODAL_ID);
}

function getIframe(): HTMLIFrameElement | null {
  return document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
}

function getContentElement(): HTMLElement | null {
  const modal = getModal();
  return modal?.querySelector('[data-calendar-content]') as HTMLElement | null;
}

function getLoadingElement(): HTMLElement | null {
  const modal = getModal();
  return modal?.querySelector('[data-calendar-loading]') as HTMLElement | null;
}

function setupIframeErrorHandling(iframe: HTMLIFrameElement): void {
  iframe.addEventListener('load', () => {
    const loading = getLoadingElement();
    if (loading) {
      loading.setAttribute('hidden', '');
    }

    try {
      const iframeWindow = iframe.contentWindow as (Window & { console?: Console }) | null;
      if (iframeWindow?.console && !import.meta.env.DEV) {
        const originalError = iframeWindow.console.error;
        if (originalError) {
          iframeWindow.console.error = (...args: unknown[]) => {
            const message = String(args[0] || '');
            const ignoredPatterns = [
              'recaptcha',
              '401',
              'Unauthorized',
              'private-token',
              'message channel closed',
            ];
            if (!ignoredPatterns.some(pattern => message.includes(pattern))) {
              originalError.apply(iframeWindow.console, args);
            }
          };
        }
      }
    } catch {
      // Cross-origin restrictions
    }
  });

  iframe.addEventListener('error', () => {
    const loading = getLoadingElement();
    if (loading) {
      loading.setAttribute('hidden', '');
    }
  });
}

function updateScrollIndicators(): void {
  const content = getContentElement();
  if (!content) return;

  const iframe = getIframe();
  if (!iframe) return;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
    const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
    const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;

    const topIndicator = content.querySelector('[data-calendar-scroll-top]');
    const bottomIndicator = content.querySelector('[data-calendar-scroll-bottom]');

    if (topIndicator) {
      topIndicator.classList.toggle('visible', scrollTop > SCROLL_THRESHOLD);
    }
    if (bottomIndicator) {
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
      bottomIndicator.classList.toggle('visible', !isAtBottom);
    }
  } catch {
    // Cross-origin restrictions
  }
}

function setupScrollIndicators(): void {
  const iframe = getIframe();
  if (!iframe) return;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.addEventListener('scroll', updateScrollIndicators, { passive: true });
      iframeDoc.addEventListener('touchmove', updateScrollIndicators, { passive: true });
      iframeDoc.addEventListener('wheel', updateScrollIndicators, { passive: true });
    }
  } catch {
    // Cross-origin restrictions
  }
}

function handleKeyboardNavigation(e: KeyboardEvent): void {
  const modal = getModal();
  if (!modal || modal.hasAttribute('hidden')) return;

  const target = e.target as HTMLElement;
  if (target?.closest('[data-calendar-close]')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCalendarModal();
    }
    return;
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    closeCalendarModal();
    return;
  }

  const iframe = getIframe();
  if (!iframe) return;

  if (!iframe.matches(':focus-within')) {
    iframe.focus();
  }

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const scrollAmount = 100;
    const pageScrollAmount = iframeDoc.documentElement.clientHeight * 0.8;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        iframeDoc.documentElement.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        iframeDoc.documentElement.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'PageDown':
        e.preventDefault();
        iframeDoc.documentElement.scrollBy({ top: pageScrollAmount, behavior: 'smooth' });
        break;
      case 'PageUp':
        e.preventDefault();
        iframeDoc.documentElement.scrollBy({ top: -pageScrollAmount, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        iframeDoc.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        iframeDoc.documentElement.scrollTo({ top: iframeDoc.documentElement.scrollHeight, behavior: 'smooth' });
        break;
    }

    setTimeout(updateScrollIndicators, 100);
  } catch {
    // Cross-origin restrictions
  }
}

function setupSwipeHandlers(): void {
  const modal = getModal();
  if (!modal) return;

  if (swipeGesture) {
    swipeGesture.destroy();
    swipeGesture = null;
  }

  swipeGesture = new DragGesture(
    modal,
    ({ active, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy] }) => {
      if (Math.abs(dy) < Math.abs(dx)) return;
      
      if (!active && dy > 0) {
        const swipeDistance = Math.abs(my);
        const swipeVelocity = Math.abs(vy);
        
        if (swipeDistance > SWIPE_DISTANCE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
          closeCalendarModal();
        }
      }
    },
    {
      axis: 'y',
      threshold: 10,
      filterTaps: true,
    }
  );
}

function openCalendarModal(): void {
  const modal = getModal();
  if (!modal) {
    if (import.meta.env.DEV) {
      console.warn('Calendar modal missing');
    }
    return;
  }

  modal.removeAttribute('hidden');

  const scrollY = window.scrollY || document.documentElement.scrollTop;
  document.documentElement.style.setProperty('--scroll-y', String(scrollY));
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  const iframe = getIframe();
  if (iframe) {
    const loading = getLoadingElement();
    if (loading) {
      loading.removeAttribute('hidden');
    }

    if (!iframe.src) {
      iframe.src = CALENDAR_URL;
    }
    setupIframeErrorHandling(iframe);
    setupScrollIndicators();
  }

  const closeButton = modal.querySelector('[data-calendar-close]') as HTMLElement;
  closeButton?.focus();

  requestAnimationFrame(() => {
    updateScrollIndicators();
  });
}

function closeCalendarModal(): void {
  const modal = getModal();
  if (!modal) return;

  if (swipeGesture) {
    swipeGesture.destroy();
    swipeGesture = null;
  }

  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function setupModalCloseHandlers(): void {
  const modal = getModal();
  if (!modal) return;

  const overlay = modal.querySelector('[data-calendar-overlay]');
  const closeButton = modal.querySelector('[data-calendar-close]');

  const handleClose = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    closeCalendarModal();
  };

  overlay?.addEventListener('click', handleClose);
  closeButton?.addEventListener('click', handleClose);
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
  buttons.forEach(setupCalendarButton);

  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[href*="calendar.app.google"], a[href*="calendar.google.com"]'
  );
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
  setupSwipeHandlers();
  setupCalendarButtons();

  document.addEventListener('keydown', handleKeyboardNavigation);

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
      console.error('Google Calendar setup failed:', error);
    }
  }
}

export function openGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  openCalendarModal();
}
