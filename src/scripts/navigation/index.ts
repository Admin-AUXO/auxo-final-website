import { state, eventListeners, resetState } from './state';
import { getNavElements, unlockScroll } from './utils';
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

export function initializeNavigation(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigationComponents);
  } else {
    initializeNavigationComponents();
  }
}

export function initializeNavigationComponents(): void {
  try {
    const { mobileMenuButton, mobileMenu } = getNavElements();
    if (mobileMenuButton && mobileMenu) {
      initializeMobileMenu();
    }

    initializeDropdowns();
    setupDropdownCloseHandlers();
    setupScrollEffects();
  } catch (error) {
    // Prevent console errors from breaking the page
    if (import.meta.env.DEV) {
      console.warn('Navigation initialization error:', error);
    }
  }
}

// Only auto-initialize if not in an Astro component script context
// Components should call initializeNavigation() explicitly
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Check if we're in a browser environment and not in an Astro component
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM is already ready, initialize immediately
    requestAnimationFrame(() => {
      initializeNavigationComponents();
    });
  } else {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        initializeNavigationComponents();
      });
    });
  }
  
  // Handle Astro page transitions
  if (typeof window !== 'undefined') {
    document.addEventListener('astro:before-swap', cleanupNavigation);
    document.addEventListener('astro:page-load', () => {
      requestAnimationFrame(initializeNavigationComponents);
    });
  }
}
