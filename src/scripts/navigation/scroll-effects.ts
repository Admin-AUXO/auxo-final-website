import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';
import { SCROLL_THRESHOLD } from './types';

export function setupScrollEffects(): void {
  const { nav } = getNavElements();
  if (!nav) return;

  function handleScroll(): void {
    if (state.isScrolling) return;

    state.isScrolling = true;
    state.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    requestAnimationFrame(() => {
      const scrollTop = state.lastScrollTop;

      if (scrollTop > SCROLL_THRESHOLD) {
        nav?.classList.add('nav-scrolled');
      } else {
        nav?.classList.remove('nav-scrolled');
      }

      state.isScrolling = false;
    });
  }

  addTrackedListener(window, 'scroll', handleScroll, { passive: true });
  handleScroll();
}

