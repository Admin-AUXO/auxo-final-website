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

    const navElement = nav; // Store in const for type narrowing

    function handleScroll(): void {
      if (state.isScrolling) return;
      state.isScrolling = true;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      state.lastScrollTop = scrollTop;

      requestAnimationFrame(() => {
        updateNavState(navElement, scrollTop);
        state.isScrolling = false;
      });
    }

    addTrackedListener(window, 'scroll', handleScroll, { passive: true });
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    updateNavState(navElement, scrollTop);

    document.addEventListener('themechange', () => {
      requestAnimationFrame(() => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        updateNavState(navElement, currentScrollTop);
      });
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Scroll effects initialization error:', error);
    }
  }
}

