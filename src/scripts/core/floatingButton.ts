import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { SCROLL_THRESHOLDS, BREAKPOINTS } from '@/scripts/constants';

let lastScrollTop = 0;
let hideTimeout: number | null = null;
let isFabHidden = false;
let isInitialized = false;
let scrollHandler: (() => void) | null = null;
let resizeHandler: (() => void) | null = null;

function updateFabVisibility(scrollTop: number): void {
  const fab = document.getElementById('floating-calendar-button');
  if (!fab) return;

  const scrollDelta = scrollTop - lastScrollTop;
  const absDelta = Math.abs(scrollDelta);
  const scrollingDown = scrollDelta > 0 && absDelta > SCROLL_THRESHOLDS.FLOATING_BUTTON_ANDROID_DELAY;
  const scrollingUp = scrollDelta < 0 && absDelta > SCROLL_THRESHOLDS.FLOATING_BUTTON_ANDROID_DELAY;
  const scrolledPastThreshold = scrollTop > SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW;

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (scrollingDown && scrolledPastThreshold && !isFabHidden) {
    fab.classList.add('fab-hidden');
    isFabHidden = true;
  } else if (scrollingUp || scrollTop <= SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW) {
    fab.classList.remove('fab-hidden');
    isFabHidden = false;

    if (scrollTop > SCROLL_THRESHOLDS.FLOATING_BUTTON_SHOW) {
      hideTimeout = window.setTimeout(() => {
        if (!isFabHidden) {
          fab.classList.add('fab-hidden');
          isFabHidden = true;
        }
      }, SCROLL_THRESHOLDS.FLOATING_BUTTON_HIDE_INITIAL);
    }
  }

  lastScrollTop = scrollTop;
}

export function initFloatingButton(): void {
  const fab = document.getElementById('floating-calendar-button');
  if (!fab) return;

  const isMobile = window.innerWidth < BREAKPOINTS.LG;

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
  const scrollThrottleDelay = /Android/i.test(navigator.userAgent) ? 100 : 32;

  scrollHandler = (): void => {
    const now = Date.now();
    if (now - lastScrollTime < scrollThrottleDelay) return;

    lastScrollTime = now;
    updateFabVisibility(getScrollTop());
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });

  resizeHandler = (): void => {
    if (window.innerWidth >= BREAKPOINTS.LG) {
      fab.classList.remove('fab-hidden');
      isFabHidden = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
  };

  window.addEventListener('resize', resizeHandler, { passive: true });

  requestAnimationFrame(() => updateFabVisibility(getScrollTop()));
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
