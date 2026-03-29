import { state, addTrackedListener } from './state';
import { getNavElements, updateNavHeight } from './utils';
import { getScrollTop } from '@/scripts/utils/scrollHelpers';
import { SCROLL_THRESHOLDS } from '@/scripts/constants';

type LenisLike = {
  on: (event: string, callback: (data: { scroll: number }) => void) => void;
  off?: (event: string, callback: (data: { scroll: number }) => void) => void;
};

let activeLenisInstance: LenisLike | null = null;
let isInitialized = false;

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  nav.classList.toggle('nav-scrolled', scrollTop > SCROLL_THRESHOLDS.SCROLL_INDICATOR_THRESHOLD);
}

function handleLenisScroll(data: { scroll: number }): void {
  const { nav } = getNavElements();
  if (!nav) return;

  if (state.isScrolling) return;
  state.isScrolling = true;

  const scrollTop = data.scroll <= 1 ? data.scroll * window.innerHeight : data.scroll;
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
  if (isInitialized) return;

  const { nav } = getNavElements();
  if (!nav) return;
  isInitialized = true;

  const lenisInstance = window.__lenis as unknown as LenisLike | undefined;
  if (lenisInstance) {
    lenisInstance.on('scroll', handleLenisScroll);
    activeLenisInstance = lenisInstance;
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

    addTrackedListener(window, 'scroll', handleScroll, { passive: true });
  }

  requestAnimationFrame(() => updateNavState(nav, getScrollTop()));

  addTrackedListener(document, 'themechange', () => {
    requestAnimationFrame(() => updateNavState(nav, getScrollTop()));
  });
}

export function cleanupScrollEffects(): void {
  if (activeLenisInstance?.off) {
    activeLenisInstance.off('scroll', handleLenisScroll);
  }
  activeLenisInstance = null;
  isInitialized = false;
}
