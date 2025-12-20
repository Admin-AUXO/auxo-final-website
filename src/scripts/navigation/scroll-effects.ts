import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';
import { SCROLL_THRESHOLD } from './types';

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  const shouldBeScrolled = scrollTop > SCROLL_THRESHOLD;
  nav.classList.toggle('nav-scrolled', shouldBeScrolled);
}

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const { nav } = getNavElements();
    if (!nav) return;

    function handleScroll(): void {
      if (state.isScrolling) return;
      state.isScrolling = true;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      state.lastScrollTop = scrollTop;

      requestAnimationFrame(() => {
        updateNavState(nav, scrollTop);
        state.isScrolling = false;
      });
    }

    addTrackedListener(window, 'scroll', handleScroll, { passive: true });
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    updateNavState(nav, scrollTop);

    document.addEventListener('themechange', () => {
      requestAnimationFrame(() => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        updateNavState(nav, currentScrollTop);
      });
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Scroll effects initialization error:', error);
    }
  }
}

