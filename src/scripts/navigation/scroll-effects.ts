import { state } from './state';
import { getNavElements } from './utils';
import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { SCROLL_THRESHOLDS } from '@/scripts/constants';

const SCROLL_THRESHOLD = SCROLL_THRESHOLDS.SCROLL_INDICATOR_THRESHOLD;

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  const shouldBeScrolled = scrollTop > SCROLL_THRESHOLD;
  nav.classList.toggle('nav-scrolled', shouldBeScrolled);
}

function handleLenisScroll(data: { scroll: number }): void {
  const { nav } = getNavElements();
  if (!nav) return;

  if (state.isScrolling) return;
  state.isScrolling = true;

  const scrollTop = data.scroll * window.innerHeight;
  state.lastScrollTop = scrollTop;

  requestAnimationFrame(() => {
    if (nav) {
      updateNavState(nav, scrollTop);
    }
    state.isScrolling = false;
  });
}

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;

  const { nav } = getNavElements();
  if (!nav) return;

  const lenisInstance = (window as any).__lenis;
  if (lenisInstance) {
    lenisInstance.on('scroll', handleLenisScroll);
  } else {
    // Fallback to native scroll if Lenis not available
    function handleScroll(): void {
      if (state.isScrolling || !nav) return;
      state.isScrolling = true;

      const scrollTop = getScrollTop();
      state.lastScrollTop = scrollTop;

      requestAnimationFrame(() => {
        if (nav) {
          updateNavState(nav, scrollTop);
        }
        state.isScrolling = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Use requestAnimationFrame to avoid forced reflows during initial setup
  requestAnimationFrame(() => {
    const initialScrollTop = getScrollTop();
    updateNavState(nav, initialScrollTop);
  });

  document.addEventListener('themechange', () => {
    requestAnimationFrame(() => {
      if (nav) updateNavState(nav, getScrollTop());
    });
  });
}
