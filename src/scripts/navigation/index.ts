import { state, addTrackedListener, eventListeners } from './state';
import { getNavElements } from './utils';
import { 
  initializeMobileMenu, 
  closeMobileMenu
} from './mobile-menu';
import { initializeDropdowns, setupDropdownCloseHandlers, closeAllDropdowns } from './dropdowns';
import { setupScrollEffects } from './scroll-effects';

// Clean up navigation state and event listeners
export function cleanupNavigation(): void {
  closeAllDropdowns();
  closeMobileMenu();
  
  state.openDropdown = null;
  state.isMobileMenuOpen = false;
  state.dropdownHoverState = false;
  state.isTransitioning = false;
  
  document.body.style.overflow = '';
  
  eventListeners.forEach(({ element, event, handler, options }) => {
    try {
      element.removeEventListener(event, handler, options);
    } catch (e) {
      // Ignore errors during cleanup
    }
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

// Initialize navigation components
function initializeNavigationComponents(): void {
  const { mobileMenuButton, mobileMenu } = getNavElements();

  if (mobileMenuButton && mobileMenu) {
    initializeMobileMenu();
  }

  initializeDropdowns();
  setupDropdownCloseHandlers();
  setupScrollEffects();
}

// Initialize navigation on page load
if (typeof document !== 'undefined') {
  initializeNavigation();
  
  document.addEventListener('astro:before-swap', cleanupNavigation);
  
  document.addEventListener('astro:page-load', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initializeNavigationComponents();
      });
    });
  });
}
