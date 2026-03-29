import { createCalendarModal, modalManager } from '@/scripts/utils/modalManager';
import { trackCalendarBooking } from '@/scripts/analytics/ga4';
import { BREAKPOINTS, SCROLL_THRESHOLDS } from '@/scripts/core/constants';
import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { loadStylesheet } from '@/scripts/utils/thirdPartyLoader';
import { logger } from '@/lib/logger';

const CALENDAR_URL = 'https://calendar.app.google/aJmnvMS2uBbYPCgC7';
const MODAL_ID = 'calendar-modal';
const FLOATING_BUTTON_ID = 'floating-calendar-button';
const SCROLL_THRESHOLD = 50;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LOAD_TIMEOUT = 15000;

const initializedButtons = new WeakSet<HTMLElement>();

let swipeCleanup: (() => void) | null = null;
let lifecycleListenersBound = false;
let floatingButtonListenersBound = false;
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
let fabHideTimeout: number | null = null;

let lastScrollTop = 0;
let isFabHidden = false;

let cachedModal: HTMLElement | null = null;
let cachedIframe: HTMLIFrameElement | null = null;
let cachedContent: HTMLElement | null = null;
let cachedLoading: HTMLElement | null = null;
let calendarStylesPromise: Promise<void> | null = null;
let calendarModalInstance: ReturnType<typeof createCalendarModal> | null = null;

function isConnected<T extends Element>(element: T | null): element is T {
  return !!element?.isConnected;
}

function resetCachedElements(): void {
  cachedModal = null;
  cachedIframe = null;
  cachedContent = null;
  cachedLoading = null;
}

function getFloatingCalendarButton(): HTMLElement | null {
  return document.getElementById(FLOATING_BUTTON_ID);
}

function getCalendarModalMarkup(): string {
  return `
    <div id="calendar-modal" class="calendar-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title" hidden>
      <div class="calendar-modal-overlay" data-calendar-overlay></div>
      <div class="calendar-modal-container">
        <div class="calendar-modal-header">
          <h2 id="calendar-modal-title" class="calendar-modal-title">Schedule a Meeting</h2>
          <button
            type="button"
            class="calendar-modal-close"
            aria-label="Close calendar"
            data-calendar-close
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="calendar-modal-content scroll-touch-smooth scroll-hidden" data-calendar-content data-modal-content data-scroll-indicators>
          <div class="calendar-loading" data-calendar-loading>
            <div class="calendar-loading-spinner"></div>
            <p class="calendar-loading-text">Loading calendar...</p>
          </div>
          <div class="calendar-scroll-indicator calendar-scroll-indicator-top scroll-indicator scroll-indicator-top" data-calendar-scroll-top data-scroll-indicator-top aria-hidden="true"></div>
          <iframe
            id="calendar-iframe"
            src=""
            title="Google Calendar - Schedule a meeting"
            loading="lazy"
            allow="fullscreen"
            referrerpolicy="no-referrer-when-downgrade"
            class="calendar-iframe scroll-touch-smooth scroll-hidden"
            data-calendar-iframe
            data-scrollable-iframe
          ></iframe>
          <div class="calendar-scroll-indicator calendar-scroll-indicator-bottom scroll-indicator scroll-indicator-bottom" data-calendar-scroll-bottom data-scroll-indicator-bottom aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;
}

function getFloatingButtonMarkup(): string {
  return `
    <div class="fab-container">
      <button
        id="floating-calendar-button"
        type="button"
        data-google-calendar-open
        class="fab-button"
        hidden
        aria-label="Schedule a meeting with AUXO Data Labs"
        title="Book an appointment"
      >
        <svg class="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="sr-only">Schedule a meeting</span>
      </button>
      <div class="fab-tooltip" role="tooltip" aria-hidden="true">
        <span>Book a meeting</span>
        <div class="fab-tooltip-arrow"></div>
      </div>
    </div>
  `;
}

function ensureCalendarUi(): void {
  if (!document.body) return;

  if (!document.getElementById(FLOATING_BUTTON_ID)) {
    document.body.insertAdjacentHTML('beforeend', getFloatingButtonMarkup());
  }

  if (!document.getElementById(MODAL_ID)) {
    document.body.insertAdjacentHTML('beforeend', getCalendarModalMarkup());
  }

  resetCachedElements();
  initializeCachedElements();
  setupSwipeHandlers();
  setupCalendarButtons();
  syncFloatingButtonState();
}

function initializeCachedElements(): void {
  if (!isConnected(cachedModal)) {
    cachedModal = document.getElementById(MODAL_ID);
  }
  if (cachedModal && !isConnected(cachedIframe)) {
    cachedIframe = document.getElementById('calendar-iframe') as HTMLIFrameElement | null;
  }
  if (cachedModal && !isConnected(cachedContent)) {
    cachedContent = cachedModal.querySelector('[data-calendar-content]') as HTMLElement | null;
  }
  if (cachedModal && !isConnected(cachedLoading)) {
    cachedLoading = cachedModal.querySelector('[data-calendar-loading]') as HTMLElement | null;
  }
}

function getModal(): HTMLElement | null {
  if (!isConnected(cachedModal)) {
    cachedModal = document.getElementById(MODAL_ID);
  }
  return cachedModal;
}

function getIframe(): HTMLIFrameElement | null {
  if (!isConnected(cachedIframe)) {
    cachedIframe = document.getElementById('calendar-iframe') as HTMLIFrameElement | null;
  }
  return cachedIframe;
}

function getContentElement(): HTMLElement | null {
  if (!isConnected(cachedContent)) {
    const modal = getModal();
    cachedContent = modal?.querySelector('[data-calendar-content]') as HTMLElement | null;
  }
  return cachedContent;
}

function getLoadingElement(): HTMLElement | null {
  if (!isConnected(cachedLoading)) {
    const modal = getModal();
    cachedLoading = modal?.querySelector('[data-calendar-loading]') as HTMLElement | null;
  }
  return cachedLoading;
}

function resetFloatingButtonTimers(): void {
  if (fabHideTimeout) {
    clearTimeout(fabHideTimeout);
    fabHideTimeout = null;
  }
}

function clearSwipeHandlers(): void {
  if (!swipeCleanup) return;
  swipeCleanup();
  swipeCleanup = null;
}

function updateFabVisibility(scrollTop: number): void {
  const fab = getFloatingCalendarButton();
  if (!fab || fab.hasAttribute('hidden')) {
    lastScrollTop = scrollTop;
    return;
  }

  const scrollDelta = scrollTop - lastScrollTop;
  const absDelta = Math.abs(scrollDelta);
  const scrollingDown =
    scrollDelta > 0 && absDelta > SCROLL_THRESHOLDS.FLOATING_BUTTON_ANDROID_DELAY;
  const scrollingUp =
    scrollDelta < 0 && absDelta > SCROLL_THRESHOLDS.FLOATING_BUTTON_ANDROID_DELAY;
  const scrolledPastThreshold = scrollTop > SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW;

  resetFloatingButtonTimers();

  if (scrollingDown && scrolledPastThreshold && !isFabHidden) {
    fab.classList.add('fab-hidden');
    isFabHidden = true;
  } else if (scrollingUp || scrollTop <= SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW) {
    fab.classList.remove('fab-hidden');
    isFabHidden = false;

    if (scrollTop > SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW) {
      fabHideTimeout = window.setTimeout(() => {
        if (!isFabHidden) {
          fab.classList.add('fab-hidden');
          isFabHidden = true;
        }
      }, SCROLL_THRESHOLDS.FLOATING_BUTTON_HIDE_INITIAL);
    }
  }

  lastScrollTop = scrollTop;
}

function syncFloatingButtonState(): void {
  const fab = getFloatingCalendarButton();
  if (!fab || fab.hasAttribute('hidden')) return;

  if (window.innerWidth >= BREAKPOINTS.LG) {
    fab.classList.remove('fab-hidden');
    isFabHidden = false;
    resetFloatingButtonTimers();
    return;
  }

  requestAnimationFrame(() => {
    updateFabVisibility(getScrollTop());
  });
}

function ensureFloatingButtonListeners(): void {
  if (floatingButtonListenersBound) return;

  floatingButtonListenersBound = true;
  let lastScrollTime = 0;

  const getScrollThrottleDelay = (): number =>
    /Android/i.test(navigator.userAgent) ? 100 : 32;

  window.addEventListener(
    'scroll',
    () => {
      if (window.innerWidth >= BREAKPOINTS.LG) return;

      const now = Date.now();
      if (now - lastScrollTime < getScrollThrottleDelay()) return;

      lastScrollTime = now;
      updateFabVisibility(getScrollTop());
    },
    { passive: true },
  );

  window.addEventListener(
    'resize',
    () => {
      syncFloatingButtonState();
    },
    { passive: true },
  );

  document.addEventListener('astro:page-load', () => {
    lastScrollTime = 0;
    syncFloatingButtonState();
  });
}

function revealFloatingCalendarButton(): void {
  const button = getFloatingCalendarButton();
  if (!button) return;

  if (button.hasAttribute('hidden')) {
    button.removeAttribute('hidden');
  }

  ensureFloatingButtonListeners();
  syncFloatingButtonState();
}

function ensureCalendarStylesLoaded(): Promise<void> {
  if (!calendarStylesPromise) {
    calendarStylesPromise = Promise.all([
      loadStylesheet('/styles/calendar-modal.css', 'calendar-modal-style'),
      loadStylesheet('/styles/fab.css', 'fab-style'),
    ])
      .then(() => {
        revealFloatingCalendarButton();
      })
      .catch((error) => {
        logger.warn('Calendar styles failed to load:', error);
      }) as Promise<void>;
  }

  return calendarStylesPromise;
}

function setupEnhancedScrolling(
  element: HTMLElement,
  config: { touchAction?: string; overscrollBehavior?: string } = {},
): void {
  const { touchAction = 'pan-y', overscrollBehavior = 'contain' } = config;
  element.style.touchAction = touchAction;
  element.style.overscrollBehavior = overscrollBehavior;
}

function setupScrollIndicators(
  container: HTMLElement,
  indicatorTop?: HTMLElement | null,
  indicatorBottom?: HTMLElement | null,
): void {
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
    if (!loading) return;

    loading.setAttribute('hidden', '');
    const errorText = loading.querySelector('.calendar-loading-text');
    if (errorText) errorText.textContent = 'Failed to load calendar. Please try again.';
  };

  loadTimeout = window.setTimeout(() => {
    if (!hasLoaded) handleError();
  }, LOAD_TIMEOUT);

  iframe.addEventListener('load', handleLoad, { once: true });
  iframe.addEventListener('error', handleError, { once: true });
}

function updateScrollIndicators(): void {
  const content = getContentElement();
  const iframe = getIframe();
  if (!content || !iframe) return;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      showAllIndicators(content);
      return;
    }

    const scrollTop =
      iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
    const scrollHeight =
      iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
    const clientHeight =
      iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;
    const isAtBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;

    toggleIndicators(
      content,
      '[data-calendar-scroll-top]',
      '[data-calendar-scroll-bottom]',
      scrollTop > SCROLL_THRESHOLD,
      !isAtBottom,
    );
  } catch {
    showAllIndicators(content);
  }
}

function toggleIndicators(
  content: HTMLElement,
  topSelector: string,
  bottomSelector: string,
  topVisible: boolean,
  bottomVisible: boolean,
): void {
  const topIndicator = content.querySelector(topSelector);
  const bottomIndicator = content.querySelector(bottomSelector);
  if (topIndicator) topIndicator.classList.toggle('visible', topVisible);
  if (bottomIndicator) bottomIndicator.classList.toggle('visible', bottomVisible);
}

function showAllIndicators(content: HTMLElement): void {
  toggleIndicators(
    content,
    '[data-calendar-scroll-top]',
    '[data-calendar-scroll-bottom]',
    true,
    true,
  );
}

function setupModalScroll(): void {
  const content = getContentElement();
  if (!content) return;

  setupEnhancedScrolling(content, {
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
  });
  const topIndicator = content.querySelector(
    '[data-scroll-indicator-top]',
  ) as HTMLElement;
  const bottomIndicator = content.querySelector(
    '[data-scroll-indicator-bottom]',
  ) as HTMLElement;
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

  if (!iframe.matches(':focus-within')) iframe.focus();

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const scrollAmount = 100;
    const pageScrollAmount = iframeDoc.documentElement.clientHeight * 0.8;
    const docElement = iframeDoc.documentElement;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        docElement.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        docElement.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'PageDown':
        e.preventDefault();
        docElement.scrollBy({ top: pageScrollAmount, behavior: 'smooth' });
        break;
      case 'PageUp':
        e.preventDefault();
        docElement.scrollBy({ top: -pageScrollAmount, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        docElement.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        docElement.scrollTo({ top: docElement.scrollHeight, behavior: 'smooth' });
        break;
    }

    setTimeout(updateScrollIndicators, 100);
  } catch {
    // Ignore cross-origin iframe navigation failures.
  }
}

function setupSwipeHandlers(): void {
  const modal = getModal();
  if (!modal) return;

  clearSwipeHandlers();

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

      if (
        swipeDistance > SWIPE_DISTANCE_THRESHOLD ||
        swipeVelocity > SWIPE_VELOCITY_THRESHOLD
      ) {
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

function destroyCalendarModalInstance(): void {
  if (!calendarModalInstance) return;

  modalManager.destroy(MODAL_ID);
  calendarModalInstance = null;
}

function resetCalendarRuntimeState(): void {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  closeCalendarModal();
  destroyCalendarModalInstance();

  clearSwipeHandlers();

  resetCachedElements();
}

function openCalendarModal(): void {
  ensureCalendarUi();

  if (!calendarModalInstance) {
    calendarModalInstance = createCalendarModal();
  }

  const modal = getModal();
  if (!modal) {
    logger.warn('Calendar modal missing');
    return;
  }

  const iframe = getIframe();
  if (!iframe) return;

  const loading = getLoadingElement();
  if (loading) {
    loading.removeAttribute('hidden');
    const errorText = loading.querySelector('.calendar-loading-text');
    if (errorText) errorText.textContent = 'Loading calendar...';
  }

  iframe.src = CALENDAR_URL;
  setupIframeErrorHandling(iframe);
  setupModalScroll();

  requestAnimationFrame(() => {
    updateScrollIndicators();
    calendarModalInstance?.open();
  });
}

function closeCalendarModal(): void {
  clearSwipeHandlers();

  calendarModalInstance?.close();
}

async function openCalendarFromTrigger(button: HTMLElement): Promise<void> {
  trackCalendarBooking({
    location: window.location.pathname,
    buttonText: button.textContent?.trim() || 'Schedule Meeting',
    context:
      button.getAttribute('data-context') ||
      button.closest('[data-section]')?.getAttribute('data-section') ||
      'unknown',
  });

  ensureCalendarUi();
  await ensureCalendarStylesLoaded();
  openCalendarModal();
}

function normalizeCalendarTrigger(button: HTMLElement): void {
  if (button instanceof HTMLAnchorElement) {
    button.removeAttribute('href');
    button.removeAttribute('target');
    button.setAttribute('role', 'button');
  }

  if (!button.hasAttribute('role')) {
    button.setAttribute('role', 'button');
  }
  button.setAttribute('tabindex', '0');
}

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  const handleClick = async (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await openCalendarFromTrigger(button);
  };

  button.addEventListener('click', handleClick, { passive: false });
  normalizeCalendarTrigger(button);

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void handleClick(e);
    }
  });

  initializedButtons.add(button);
}

function setupCalendarButtons(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const buttons =
    document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
  buttons.forEach(setupCalendarButton);

  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[href*="calendar.app.google"], a[href*="calendar.google.com"]',
  );
  links.forEach((link) => {
    if (
      !link.hasAttribute('data-google-calendar-open') &&
      !initializedButtons.has(link)
    ) {
      link.setAttribute('data-google-calendar-open', '');
      setupCalendarButton(link);
    }
  });
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  setupCalendarButtons();

  if (!lifecycleListenersBound) {
    lifecycleListenersBound = true;

    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('astro:page-load', () => {
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }
      refreshTimeoutId = setTimeout(() => {
        setupCalendarButtons();
        syncFloatingButtonState();
      }, 100);
    });
    document.addEventListener(
      'astro:before-preparation',
      resetCalendarRuntimeState,
    );
  }
}

export function setupGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    initializeGoogleCalendar();
  } catch (error) {
    logger.error('Google Calendar setup failed:', error);
  }
}

