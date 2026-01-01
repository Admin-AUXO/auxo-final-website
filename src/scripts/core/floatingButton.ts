import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { SCROLL_THRESHOLDS, Z_INDEX } from '@/scripts/constants';

const FAB_SCROLL_THRESHOLD = SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW;
const FAB_HIDE_DELAY = SCROLL_THRESHOLDS.FLOATING_BUTTON_HIDE_INITIAL;
const FAB_SCROLL_HIDE_THRESHOLD = SCROLL_THRESHOLDS.FLOATING_BUTTON_ANDROID_DELAY;

let lastScrollTop = 0;
let hideTimeout: number | null = null;
let isFabHidden = false;
let isInitialized = false;
let scrollHandler: (() => void) | null = null;
let resizeHandler: (() => void) | null = null;

function getFabElement(): HTMLElement | null {
  return document.getElementById('floating-calendar-button');
}

function updateFabVisibility(scrollTop: number): void {
  const fab = getFabElement();
  if (!fab) return;

  const scrollDelta = scrollTop - lastScrollTop;
  const scrollingDown = scrollDelta > 0 && Math.abs(scrollDelta) > FAB_SCROLL_HIDE_THRESHOLD;
  const scrollingUp = scrollDelta < 0 && Math.abs(scrollDelta) > FAB_SCROLL_HIDE_THRESHOLD;
  const scrolledPastThreshold = scrollTop > FAB_SCROLL_THRESHOLD;

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (scrollingDown && scrolledPastThreshold && !isFabHidden) {
    fab.classList.add('fab-hidden');
    isFabHidden = true;
  } else if (scrollingUp || scrollTop <= FAB_SCROLL_THRESHOLD) {
    fab.classList.remove('fab-hidden');
    isFabHidden = false;

    if (scrollTop > FAB_SCROLL_THRESHOLD) {
      hideTimeout = window.setTimeout(() => {
        if (!isFabHidden) {
          fab.classList.add('fab-hidden');
          isFabHidden = true;
        }
      }, FAB_HIDE_DELAY);
    }
  }

  lastScrollTop = scrollTop;
}

export function initFloatingButton(): void {
  const fab = getFabElement();
  if (!fab) return;

  const isMobile = window.innerWidth < 1024;
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isInitialized) {
    if (!isMobile) {
      fab.classList.remove('fab-hidden');
      isFabHidden = false;
    }
    return;
  }

  if (!isMobile) {
    isInitialized = true;
    return;
  }

  isInitialized = true;

  let lastScrollTime = 0;
  const scrollThrottleDelay = isAndroid ? 100 : 32;

  scrollHandler = (): void => {
    const now = Date.now();
    if (now - lastScrollTime < scrollThrottleDelay) return;

    lastScrollTime = now;
    const scrollTop = getScrollTop();
    updateFabVisibility(scrollTop);
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });

  resizeHandler = (): void => {
    const newIsMobile = window.innerWidth < 1024;
    if (!newIsMobile) {
      fab.classList.remove('fab-hidden');
      isFabHidden = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
  };

  window.addEventListener('resize', resizeHandler, { passive: true });

  // Use requestAnimationFrame to avoid forced reflows during initial setup
  requestAnimationFrame(() => {
    updateFabVisibility(getScrollTop());
  });
}

export function cleanupFloatingButton(): void {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  isInitialized = false;
  isFabHidden = false;
  lastScrollTop = 0;
}
