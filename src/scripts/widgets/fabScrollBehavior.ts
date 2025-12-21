const FAB_SCROLL_THRESHOLD = 200;
const FAB_HIDE_DELAY = 1500;
const FAB_SCROLL_HIDE_THRESHOLD = 50;

let lastScrollTop = 0;
let hideTimeout: number | null = null;
let isFabHidden = false;

function getFabElement(): HTMLElement | null {
  return document.getElementById('floating-calendar-button');
}

function getScrollTop(): number {
  return window.lenis?.scroll || window.pageYOffset || document.documentElement.scrollTop;
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

export function setupFabScrollBehavior(): void {
  if (typeof window === 'undefined') return;

  const fab = getFabElement();
  if (!fab) return;

  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return;

  function handleScroll(): void {
    const scrollTop = getScrollTop();
    requestAnimationFrame(() => updateFabVisibility(scrollTop));
  }

  if (window.lenis) {
    window.lenis.on('scroll', handleScroll);
  } else {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth < 1024;
    if (!newIsMobile) {
      fab.classList.remove('fab-hidden');
      isFabHidden = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
  }, { passive: true });

  updateFabVisibility(getScrollTop());
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFabScrollBehavior);
  } else {
    setupFabScrollBehavior();
  }
}