import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';
import { SCROLL_THRESHOLD } from './types';

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const { nav } = getNavElements();
    if (!nav) return;

    function handleScroll(): void {
      if (state.isScrolling) return;

      state.isScrolling = true;
      state.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

      requestAnimationFrame(() => {
        if (nav) {
          nav.classList.toggle('nav-scrolled', state.lastScrollTop > SCROLL_THRESHOLD);
        }
        state.isScrolling = false;
      });
    }

    addTrackedListener(window, 'scroll', handleScroll, { passive: true });
    handleScroll();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Scroll effects initialization error:', error);
    }
  }
}

