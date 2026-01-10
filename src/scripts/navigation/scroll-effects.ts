import { state } from './state';
import { getNavElements, updateNavHeight } from './utils';
import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { SCROLL_THRESHOLDS } from '@/scripts/constants';

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  nav.classList.toggle('nav-scrolled', scrollTop > SCROLL_THRESHOLDS.SCROLL_INDICATOR_THRESHOLD);
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
      updateNavHeight();
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
    function handleScroll(): void {
      if (state.isScrolling || !nav) return;
      state.isScrolling = true;

      const scrollTop = getScrollTop();
      state.lastScrollTop = scrollTop;

      requestAnimationFrame(() => {
        if (nav) {
          updateNavState(nav, scrollTop);
          updateNavHeight();
        }
        state.isScrolling = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  requestAnimationFrame(() => updateNavState(nav, getScrollTop()));

  document.addEventListener('themechange', () => {
    requestAnimationFrame(() => updateNavState(nav, getScrollTop()));
  });
}
