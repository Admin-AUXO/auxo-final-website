import { eventListeners, resetState } from './state';
import { unlockScroll, getNavElements } from './utils';
import { initializeMobileMenu, closeMobileMenu } from './mobile-menu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from './dropdowns';
import { setupScrollEffects } from './scroll-effects';

export function cleanupNavigation(): void {
  closeAllDropdowns();
  closeMobileMenu();
  resetState();
  unlockScroll();

  eventListeners.forEach(({ element, event, handler, options }) => {
    try {
      element.removeEventListener(event, handler, options);
    } catch {
      // Ignore cleanup errors
    }
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

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const init = () => requestAnimationFrame(initializeNavigationComponents);

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }

  document.addEventListener('astro:before-swap', cleanupNavigation);
  document.addEventListener('astro:page-load', init);
}
