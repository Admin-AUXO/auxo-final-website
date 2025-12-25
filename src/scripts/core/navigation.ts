import { initializeMobileMenu, closeMobileMenu } from './mobileMenu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from './dropdowns';
import { setupScrollEffects } from '../navigation/scroll-effects';
import { getNavElements } from '../navigation/utils';
import { resetState, eventListeners } from '../navigation/state';
import { forceUnlockScroll } from '../navigation/utils';

export function initNavigation(): void {
  if (typeof document === 'undefined') return;

  const { mobileMenuButton, mobileMenu } = getNavElements();
  if (mobileMenuButton && mobileMenu) {
    initializeMobileMenu();
  }

  initializeDropdowns();
  setupScrollEffects();
  setupDropdownCloseHandlers();
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

