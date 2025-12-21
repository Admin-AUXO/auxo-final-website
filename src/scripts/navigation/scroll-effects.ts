import { state, addTrackedListener } from './state';
import { getNavElements } from './utils';

const SCROLL_THRESHOLD = 10;
const AUTO_HIDE_THRESHOLD = 100;
const AUTO_HIDE_DELAY = 300;

let lastScrollTop = 0;
let hideTimeout: number | null = null;
let isAutoHiding = false;

function updateNavState(nav: HTMLElement, scrollTop: number): void {
  const shouldBeScrolled = scrollTop > SCROLL_THRESHOLD;
  nav.classList.toggle('nav-scrolled', shouldBeScrolled);
}

function updateNavVisibility(nav: HTMLElement, scrollTop: number, isMobile: boolean): void {
  if (!isMobile) return;

  const scrollDelta = scrollTop - lastScrollTop;
  const scrollingDown = scrollDelta > 0;
  const scrollingUp = scrollDelta < 0;
  const scrolledPastThreshold = scrollTop > AUTO_HIDE_THRESHOLD;

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (scrollingDown && scrolledPastThreshold && !isAutoHiding) {
    nav.classList.add('nav-hidden');
    isAutoHiding = true;
  } else if (scrollingUp || scrollTop <= AUTO_HIDE_THRESHOLD) {
    nav.classList.remove('nav-hidden');
    isAutoHiding = false;

    hideTimeout = window.setTimeout(() => {
      if (scrollTop > AUTO_HIDE_THRESHOLD && !state.isMobileMenuOpen) {
        nav.classList.add('nav-hidden');
        isAutoHiding = true;
      }
    }, AUTO_HIDE_DELAY);
  }

  lastScrollTop = scrollTop;
}

function isMobileDevice(): boolean {
  return window.innerWidth < 1024; // lg breakpoint
}

function getScrollTop(): number {
  return window.lenis?.scroll || window.pageYOffset || document.documentElement.scrollTop;
}

export function setupScrollEffects(): void {
  if (typeof window === 'undefined') return;

  const { nav } = getNavElements();
  if (!nav) return;

  const isMobile = isMobileDevice();

  function handleScroll(): void {
    if (state.isScrolling || !nav) return;
    state.isScrolling = true;

    const scrollTop = getScrollTop();
    state.lastScrollTop = scrollTop;

    requestAnimationFrame(() => {
      if (nav) {
        updateNavState(nav, scrollTop);
        updateNavVisibility(nav, scrollTop, isMobile);
      }
      state.isScrolling = false;
    });
  }

  window.lenis?.on('scroll', handleScroll) || addTrackedListener(window, 'scroll', handleScroll, { passive: true });

  const initialScrollTop = getScrollTop();
  updateNavState(nav, initialScrollTop);
  updateNavVisibility(nav, initialScrollTop, isMobile);

  addTrackedListener(window, 'resize', () => {
    const newIsMobile = isMobileDevice();
    if (newIsMobile !== isMobile) {
      nav.classList.remove('nav-hidden');
      isAutoHiding = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
  }, { passive: true });

  document.addEventListener('themechange', () => {
    requestAnimationFrame(() => {
      if (nav) updateNavState(nav, getScrollTop());
    });
  });
}

