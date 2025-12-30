import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';

const SCROLL_THRESHOLD = 10;

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  const shouldBeScrolled = scrollTop > SCROLL_THRESHOLD;
  nav.classList.toggle('nav-scrolled', shouldBeScrolled);
}


function getScrollTop(): number {
  return window.pageYOffset || document.documentElement.scrollTop;
}

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;

  const { nav } = getNavElements();
  if (!nav) return;

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

  addTrackedListener(window, 'scroll', handleScroll, { passive: true });

  const initialScrollTop = getScrollTop();
  updateNavState(nav, initialScrollTop);

  document.addEventListener('themechange', () => {
    requestAnimationFrame(() => {
      if (nav) updateNavState(nav, getScrollTop());
    });
  });
}

