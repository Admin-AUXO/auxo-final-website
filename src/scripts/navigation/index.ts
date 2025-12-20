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
    } catch (e) {}
  });
  eventListeners.length = 0;
}

export function initializeNavigationComponents(): void {
  try {
    const { mobileMenuButton, mobileMenu } = getNavElements();
    if (mobileMenuButton && mobileMenu) {
      initializeMobileMenu();
    }

    initializeDropdowns();
    setupScrollEffects();
    setupDropdownCloseHandlers();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Navigation initialization error:', error);
    }
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const init = () => requestAnimationFrame(initializeNavigationComponents);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  document.addEventListener('astro:before-swap', cleanupNavigation);
  document.addEventListener('astro:page-load', init);
}
