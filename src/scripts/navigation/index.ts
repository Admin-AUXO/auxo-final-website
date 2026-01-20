import { cleanupNavigationListeners, resetState } from './state';
import { getNavElements, updateNavHeight } from './utils';
import { initializeMobileMenu, closeMobileMenu } from './mobile-menu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from './dropdowns';
import { setupScrollEffects } from './scroll-effects';
import { forceUnlockScroll } from './utils';

let navigationHistory: string[] = [];

function setupPageTransitionTracking(): void {
  document.addEventListener('astro:before-preparation', (e: any) => {
    const currentPath = window.location.pathname;
    const newPath = e.detail.to.pathname;

    if (navigationHistory[navigationHistory.length - 1] === newPath) {
      document.documentElement.dataset.navigation = 'back';
      navigationHistory.pop();
    } else {
      document.documentElement.dataset.navigation = 'forward';
      navigationHistory.push(currentPath);
    }
  });

  document.addEventListener('astro:after-swap', () => {
    delete document.documentElement.dataset.navigation;
  });
}

export function cleanupNavigation(): void {
  closeAllDropdowns();
  closeMobileMenu();
  resetState();
  forceUnlockScroll();
  cleanupNavigationListeners();
}

export function initNavigation(): void {
  if (typeof document === 'undefined') return;

  const { mobileMenuButton, mobileMenu } = getNavElements();
  if (mobileMenuButton && mobileMenu) {
    initializeMobileMenu();
  }

  initializeDropdowns();
  setupScrollEffects();
  setupDropdownCloseHandlers();
  setupPageTransitionTracking();

  requestAnimationFrame(() => {
    updateNavHeight();

    window.addEventListener('resize', updateNavHeight, { passive: true });
  });
}

export const initializeNavigationComponents = initNavigation;
