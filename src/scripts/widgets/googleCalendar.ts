import { createCalendarModal } from '@/scripts/utils/modalManager';
import { trackCalendarBooking } from '@/scripts/analytics/ga4';
import { logger } from '@/lib/logger';

const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2C0u3FKkxjcB1xO6fM48pvPj4Gu32PZAMVDq889-Nuer8fP_zWvl95xV_r4O5fm2Ry_KP1vnNG?gv=true';
const MODAL_ID = 'calendar-modal';
const IFRAME_ID = 'calendar-iframe';
const SCROLL_THRESHOLD = 50;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LOAD_TIMEOUT = 15000;

const initializedButtons = new WeakSet<HTMLElement>();
let swipeCleanup: (() => void) | null = null;

function setupEnhancedScrolling(element: HTMLElement, config: { touchAction?: string; overscrollBehavior?: string } = {}): void {
  const { touchAction = 'pan-y', overscrollBehavior = 'contain' } = config;
  element.style.touchAction = touchAction;
  element.style.overscrollBehavior = overscrollBehavior;
}

function setupScrollIndicators(container: HTMLElement, indicatorTop?: HTMLElement | null, indicatorBottom?: HTMLElement | null): void {
  if (!indicatorTop && !indicatorBottom) return;

  const updateIndicators = () => {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const shouldShowTop = scrollTop > 20;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (indicatorTop) {
      indicatorTop.classList.toggle('visible', shouldShowTop);
    }
    if (indicatorBottom) {
      indicatorBottom.classList.toggle('visible', !isAtBottom);
    }
  };

  container.addEventListener('scroll', updateIndicators, { passive: true });
  updateIndicators();
}

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
  let hasLoaded = false;
  let loadTimeout: number | null = null;

  const handleLoad = () => {
    try {
      hasLoaded = true;
      if (loadTimeout) clearTimeout(loadTimeout);
      const loadingEl = getLoadingElement();
      if (loadingEl) loadingEl.setAttribute('hidden', '');
    } catch (error) {
      logger.warn('Calendar iframe load handling error:', error);
    }
  };

  const handleError = () => {
    if (hasLoaded) return;
    const loading = getLoadingElement();
    if (loading) {
      loading.setAttribute('hidden', '');
      const errorText = loading.querySelector('.calendar-loading-text');
      if (errorText) errorText.textContent = 'Failed to load calendar. Please try again.';
    }
  };

  loadTimeout = window.setTimeout(() => {
    if (!hasLoaded) handleError();
  }, LOAD_TIMEOUT);

  iframe.addEventListener('load', handleLoad);
  iframe.addEventListener('error', handleError);
}

function updateScrollIndicators(): void {
  const content = getContentElement();
  if (!content) return;

  const iframe = getIframe();
  if (!iframe) return;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      showAllIndicators(content);
      return;
    }

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
    showAllIndicators(content);
  }
}

function showAllIndicators(content: HTMLElement): void {
  const topIndicator = content.querySelector('[data-calendar-scroll-top]');
  const bottomIndicator = content.querySelector('[data-calendar-scroll-bottom]');
  topIndicator?.classList.add('visible');
  bottomIndicator?.classList.add('visible');
}

function setupModalScroll(): void {
  const content = getContentElement();
  if (!content) return;

  setupEnhancedScrolling(content, { touchAction: 'pan-y', overscrollBehavior: 'contain' });
  const topIndicator = content.querySelector('[data-scroll-indicator-top]') as HTMLElement;
  const bottomIndicator = content.querySelector('[data-scroll-indicator-bottom]') as HTMLElement;
  setupScrollIndicators(content, topIndicator, bottomIndicator);
}

function handleKeyboardNavigation(e: KeyboardEvent): void {
  const modal = getModal();
  if (!modal || modal.hasAttribute('hidden')) return;

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
  }
}

function setupSwipeHandlers(): void {
  const modal = getModal();
  if (!modal) return;

  if (swipeCleanup) {
    swipeCleanup();
    swipeCleanup = null;
  }

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
  };

  const handlePointerUp = (e: PointerEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const deltaTime = Date.now() - startTime;

    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    if (deltaY > 0) {
      const swipeDistance = Math.abs(deltaY);
      const swipeVelocity = Math.abs(deltaY / deltaTime);

      if (swipeDistance > SWIPE_DISTANCE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
        closeCalendarModal();
      }
    }
  };

  modal.addEventListener('pointerdown', handlePointerDown);
  modal.addEventListener('pointerup', handlePointerUp);

  swipeCleanup = () => {
    modal.removeEventListener('pointerdown', handlePointerDown);
    modal.removeEventListener('pointerup', handlePointerUp);
  };
}

let calendarModalInstance: ReturnType<typeof createCalendarModal> | null = null;

function openCalendarModal(): void {
  if (!calendarModalInstance) {
    calendarModalInstance = createCalendarModal();
  }

  const modal = getModal();
  if (!modal) {
    logger.warn('Calendar modal missing');
    return;
  }

  const iframe = getIframe();
  if (iframe) {
    const loading = getLoadingElement();
    if (loading) {
      loading.removeAttribute('hidden');
      const errorText = loading.querySelector('.calendar-loading-text');
      if (errorText) {
        errorText.textContent = 'Loading calendar...';
      }
    }

    iframe.src = CALENDAR_URL;
    setupIframeErrorHandling(iframe);
    setupModalScroll();
  }

  requestAnimationFrame(() => {
    updateScrollIndicators();
    calendarModalInstance?.open();
  });
}

function closeCalendarModal(): void {
  if (swipeCleanup) {
    swipeCleanup();
    swipeCleanup = null;
  }
  calendarModalInstance?.close();
}

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  const handleClick = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    trackCalendarBooking({
      location: window.location.pathname,
      buttonText: button.textContent?.trim() || 'Schedule Meeting',
      context: button.getAttribute('data-context') || button.closest('[data-section]')?.getAttribute('data-section') || 'unknown',
    });

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

  setupSwipeHandlers();
  setupCalendarButtons();
  document.addEventListener('keydown', handleKeyboardNavigation);

  const initFunctions = () => {
    setupCalendarButtons();
  };

  document.addEventListener('astro:page-load', () => setTimeout(initFunctions, 100), { once: false });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFunctions, { once: true });
  } else {
    initFunctions();
  }

  window.addEventListener('load', initFunctions, { once: true });
}

export function setupGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    initializeGoogleCalendar();
  } catch (error) {
    logger.error('Google Calendar setup failed:', error);
  }
}

export function openGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  openCalendarModal();
}
