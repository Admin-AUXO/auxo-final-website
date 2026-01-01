import { initializeMobileMenu, closeMobileMenu } from '../navigation/mobile-menu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from '../navigation/dropdowns';
import { setupScrollEffects } from '../navigation/scroll-effects';
import { getNavElements } from '../navigation/utils';
import { resetState, eventListeners } from '../navigation/state';
import { forceUnlockScroll } from '../navigation/utils';

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
}

export function cleanupNavigation(): void {
  closeAllDropdowns();
  closeMobileMenu();
  resetState();
  forceUnlockScroll();

  eventListeners.forEach(({ element, event, handler, options }) => {
    try {
      element.removeEventListener(event, handler, options);
    } catch {}
  });
  eventListeners.length = 0;
}
