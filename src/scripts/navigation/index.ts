import { eventListeners, resetState } from './state';
import { getNavElements } from './utils';
import { initializeMobileMenu, closeMobileMenu } from './mobile-menu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from './dropdowns';
import { setupScrollEffects } from './scroll-effects';

import { forceUnlockScroll } from './utils';

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

export function initializeNavigationComponents(): void {
  const { mobileMenuButton, mobileMenu } = getNavElements();
  if (mobileMenuButton && mobileMenu) {
    initializeMobileMenu();
  }

  initializeDropdowns();
  setupScrollEffects();
  setupDropdownCloseHandlers();
}

// Navigation functions exported for core initialization
