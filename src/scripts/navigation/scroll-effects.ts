import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';

const SCROLL_THRESHOLD = 10;

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  const shouldBeScrolled = scrollTop > SCROLL_THRESHOLD;
  nav.classList.toggle('nav-scrolled', shouldBeScrolled);
}

function getScrollTop(): number {
  return window.lenis?.scroll || window.pageYOffset || document.documentElement.scrollTop;
}

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;

  try {
    const { nav } = getNavElements();
    if (!nav) return;

    function handleScroll(): void {
      if (state.isScrolling || !nav) return;
      state.isScrolling = true;

      const scrollTop = getScrollTop();
      state.lastScrollTop = scrollTop;

      requestAnimationFrame(() => {
        if (nav) updateNavState(nav, scrollTop);
        state.isScrolling = false;
      });
    }

    window.lenis?.on('scroll', handleScroll) || addTrackedListener(window, 'scroll', handleScroll, { passive: true });

    if (nav) updateNavState(nav, getScrollTop());

    document.addEventListener('themechange', () => {
      requestAnimationFrame(() => {
        if (nav) updateNavState(nav, getScrollTop());
      });
    });
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Scroll effects init failed:', error);
  }
}

