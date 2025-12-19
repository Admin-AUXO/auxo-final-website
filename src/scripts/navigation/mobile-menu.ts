import { state, addTrackedListener } from './state';
import { getNavElements, resetDropdownStyles, findDropdownContent, lockScroll, unlockScroll } from './utils';
import { DROPDOWN_ANIMATION_DURATION, DROPDOWN_CLOSE_DELAY } from './types';
import { createFocusTrap } from 'focus-trap';

let focusTrap: ReturnType<typeof createFocusTrap> | null = null;

/**
 * Calculate the exact height needed for dropdown content
 * Uses a more reliable method that measures the actual rendered content
 */
function calculateDropdownHeight(content: HTMLElement): number {
  // Store original state
  const originalDisplay = content.style.display;
  const originalMaxHeight = content.style.maxHeight;
  const originalVisibility = content.style.visibility;
  const originalOverflow = content.style.overflow;
  const originalOpacity = content.style.opacity;
  
  // Make content fully visible for accurate measurement
  content.style.display = 'block';
  content.style.maxHeight = 'none';
  content.style.visibility = 'hidden';
  content.style.overflow = 'visible';
  content.style.opacity = '0';
  content.style.height = 'auto';
  
  // Force reflow
  void content.offsetHeight;
  
  // Get the inner container (the div with space-y-2)
  const innerDiv = content.querySelector('div:first-child');
  let height = 0;
  
  // Measure the inner div which contains all the actual content
  if (innerDiv) {
    // Get computed styles to account for any margins
    const computed = window.getComputedStyle(innerDiv);
    const marginTop = parseFloat(computed.marginTop) || 0;
    const marginBottom = parseFloat(computed.marginBottom) || 0;
    
    // Use scrollHeight which includes all content and spacing
    height = innerDiv.scrollHeight + marginTop + marginBottom;
  } else {
    // Fallback to content scrollHeight
    height = content.scrollHeight;
  }
  
  // Restore original state
  content.style.display = originalDisplay;
  content.style.maxHeight = originalMaxHeight;
  content.style.visibility = originalVisibility;
  content.style.overflow = originalOverflow;
  content.style.opacity = originalOpacity;
  
  // Add 1px buffer for rounding - no need for extra padding
  return Math.ceil(height) + 1;
}

/**
 * Animate dropdown opening with smooth transition
 */
function animateDropdownOpen(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  // Remove hidden class and ensure it's display block
  content.classList.remove('hidden');
  content.style.display = 'block';
  
  // Calculate exact height needed
  const targetHeight = calculateDropdownHeight(content);
  content.style.setProperty('--dropdown-max-height', `${targetHeight}px`);
  
  // Reset any previous animation states
  content.classList.remove('dropdown-opening', 'dropdown-closing');
  
  // Start animation in next frame
  requestAnimationFrame(() => {
    content.classList.add('dropdown-opening');
    
    // Make all items visible immediately (no stagger animation for better UX)
    const childItems = content.querySelectorAll('.mobile-nav-link');
    childItems.forEach((item) => {
      (item as HTMLElement).style.opacity = '1';
      (item as HTMLElement).style.transform = 'translateX(0)';
    });
    
    // Auto-scroll to keep dropdown button visible when it opens
    setTimeout(() => {
      const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
      if (menuContent) {
        const wrapper = buttonEl.closest('.mobile-dropdown-wrapper') as HTMLElement;
        if (wrapper) {
          const wrapperRect = wrapper.getBoundingClientRect();
          const menuRect = menuContent.getBoundingClientRect();
          
          // Check if button is above viewport
          if (wrapperRect.top < menuRect.top) {
            const scrollAmount = menuContent.scrollTop + (wrapperRect.top - menuRect.top) - 16;
            menuContent.scrollTo({
              top: Math.max(0, scrollAmount),
              behavior: 'smooth'
            });
          }
          // Check if button is below viewport (after dropdown expands)
          else if (wrapperRect.bottom > menuRect.bottom) {
            const scrollAmount = menuContent.scrollTop + (wrapperRect.bottom - menuRect.bottom) + 16;
            menuContent.scrollTo({
              top: Math.min(menuContent.scrollHeight - menuContent.clientHeight, scrollAmount),
              behavior: 'smooth'
            });
          }
        }
      }
    }, 200);
    
    // Clean up after animation completes
    setTimeout(() => resetDropdownStyles(content), DROPDOWN_ANIMATION_DURATION);
  });
  
  icon?.classList.add('open');
  buttonEl.setAttribute('aria-expanded', 'true');
}

/**
 * Animate dropdown closing
 */
function animateDropdownClose(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  // Get current height before closing
  const currentHeight = content.scrollHeight;
  content.style.setProperty('--dropdown-max-height', `${currentHeight}px`);
  
  // Reset animation states
  content.classList.remove('dropdown-opening', 'dropdown-closing');
  content.classList.add('dropdown-opening');
  
  // Force reflow
  void content.offsetHeight;
  
  // Start closing animation
  requestAnimationFrame(() => {
    content.classList.remove('dropdown-opening');
    content.classList.add('dropdown-closing');
    
    setTimeout(() => {
      content.classList.add('hidden');
      resetDropdownStyles(content);
    }, DROPDOWN_CLOSE_DELAY);
  });
  
  icon?.classList.remove('open');
  buttonEl.setAttribute('aria-expanded', 'false');
}

/**
 * Toggle mobile dropdown state
 */
function toggleMobileDropdown(buttonEl: HTMLElement): void {
  const content = findDropdownContent(buttonEl);
  if (!content) return;
  
  const icon = buttonEl.querySelector('.dropdown-arrow-mobile');
  const isHidden = content.classList.contains('hidden');
  
  if (isHidden) {
    animateDropdownOpen(content, icon, buttonEl);
  } else {
    animateDropdownClose(content, icon, buttonEl);
  }
}

/**
 * Setup mobile dropdown event handlers
 */
export function setupMobileDropdowns(): void {
  document.querySelectorAll('#mobile-menu .mobile-dropdown-btn').forEach(button => {
    if ((button as HTMLElement).dataset.initialized === 'true') return;
    
    const handler = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileDropdown(button as HTMLElement);
    };
    
    addTrackedListener(button, 'click', handler, { capture: true });
    addTrackedListener(button, 'touchend', handler, { capture: true, passive: false });
    (button as HTMLElement).dataset.initialized = 'true';
  });
}

function deactivateFocusTrap(): void {
  if (focusTrap) {
    focusTrap.deactivate();
    focusTrap = null;
  }
}

function resetMobileDropdowns(): void {
  document.querySelectorAll('#mobile-menu .mobile-dropdown-content').forEach(content => {
    const button = (content as HTMLElement).previousElementSibling;
    if (button?.classList.contains('mobile-dropdown-btn')) {
      resetDropdownStyles(content as HTMLElement);
      (content as HTMLElement).classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
      button.querySelector('.dropdown-arrow-mobile')?.classList.remove('open');
    }
  });
}

export function closeMobileMenu(): void {
  const { mobileMenu, mobileMenuButton, mobileMenuOverlay, nav } = getNavElements();
  
  if (!mobileMenu || !state.isMobileMenuOpen) return;
  
  state.isMobileMenuOpen = false;
  deactivateFocusTrap();
  
  void mobileMenu.offsetHeight;
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  
  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.remove('is-open');
    mobileMenuOverlay.setAttribute('aria-hidden', 'true');
  }
  
  nav?.removeAttribute('data-menu-open');
  mobileMenuButton?.setAttribute('aria-expanded', 'false');
  mobileMenuButton?.focus();
  
  unlockScroll();
  resetMobileDropdowns();
}

function setupLinkHandlers(): void {
  const { mobileMenu } = getNavElements();
  if (!mobileMenu) return;
  
  mobileMenu.querySelectorAll('a').forEach(link => {
    addTrackedListener(link, 'click', closeMobileMenu);
  });
}

function openMobileMenu(): void {
  const { mobileMenu, mobileMenuButton, mobileMenuOverlay, nav } = getNavElements();
  
  if (!mobileMenu || !mobileMenuButton || state.isMobileMenuOpen) return;
  
  state.isMobileMenuOpen = true;
  void mobileMenu.offsetHeight;
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  
  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.add('is-open');
    mobileMenuOverlay.setAttribute('aria-hidden', 'false');
  }
  
  nav?.setAttribute('data-menu-open', 'true');
  mobileMenuButton.setAttribute('aria-expanded', 'true');
  lockScroll();
  
  focusTrap = createFocusTrap(mobileMenu, {
    allowOutsideClick: true,
    escapeDeactivates: true,
    returnFocusOnDeactivate: true,
    initialFocus: mobileMenu,
    setReturnFocus: mobileMenuButton,
  });
  
  requestAnimationFrame(() => {
    try {
      focusTrap?.activate();
    } catch (e) {
      // Silently handle focus trap errors
    }
    
    setupMobileDropdowns();
    setupLinkHandlers();
    setupCloseButtonHandler();
    setupDropdownKeyboardNavigation();
  });
}

export function toggleMobileMenu(): void {
  const { mobileMenu } = getNavElements();
  if (!mobileMenu) return;
  
  const isOpen = mobileMenu.classList.contains('is-open');
  
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function handleMenuButtonClick(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  toggleMobileMenu();
}

function handleOutsideClick(e: Event): void {
  const target = e.target as HTMLElement;
  const { nav, mobileMenu, mobileMenuOverlay } = getNavElements();
  
  if (!nav || !mobileMenu) return;
  if (nav.contains(target) || mobileMenu.contains(target)) return;
  
  if (mobileMenu.classList.contains('is-open') && mobileMenuOverlay?.contains(target)) {
    closeMobileMenu();
  }
}

function handleKeyboard(e: Event): void {
  const keyboardEvent = e as KeyboardEvent;
  
  if (keyboardEvent.key === 'Escape') {
    const { mobileMenu } = getNavElements();
    if (mobileMenu?.classList.contains('is-open')) {
      e.preventDefault();
      closeMobileMenu();
    }
  }
  
  // Handle dropdown navigation with arrow keys
  if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.classList.contains('mobile-dropdown-btn')) {
      e.preventDefault();
      
      const content = findDropdownContent(activeElement);
      if (content && content.classList.contains('dropdown-opening')) {
        const firstItem = content.querySelector('.mobile-nav-link') as HTMLElement;
        firstItem?.focus();
      } else {
        toggleMobileDropdown(activeElement);
      }
    }
  }
}

function setupCloseButtonHandler(): void {
  const { mobileMenuCloseBtn, mobileMenuCloseBtnHeader } = getNavElements();
  
  const handler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    closeMobileMenu();
  };
  
  if (mobileMenuCloseBtnHeader) {
    if ((mobileMenuCloseBtnHeader as HTMLElement).dataset.initialized !== 'true') {
      addTrackedListener(mobileMenuCloseBtnHeader, 'click', handler, { capture: true });
      addTrackedListener(mobileMenuCloseBtnHeader, 'touchend', handler, { passive: false, capture: true });
      (mobileMenuCloseBtnHeader as HTMLElement).dataset.initialized = 'true';
    }
  }
  
  if (mobileMenuCloseBtn) {
    if ((mobileMenuCloseBtn as HTMLElement).dataset.initialized !== 'true') {
      addTrackedListener(mobileMenuCloseBtn, 'click', handler, { capture: true });
      addTrackedListener(mobileMenuCloseBtn, 'touchend', handler, { passive: false, capture: true });
      (mobileMenuCloseBtn as HTMLElement).dataset.initialized = 'true';
    }
  }
}

function setupDropdownKeyboardNavigation(): void {
  document.querySelectorAll('#mobile-menu .mobile-dropdown-content').forEach(content => {
    const items = content.querySelectorAll('.mobile-nav-link');
    items.forEach((item, index) => {
      addTrackedListener(item, 'keydown', (e: Event) => {
        const keyboardEvent = e as KeyboardEvent;
        const target = e.target as HTMLElement;
        
        if (keyboardEvent.key === 'ArrowDown' && index < items.length - 1) {
          e.preventDefault();
          (items[index + 1] as HTMLElement).focus();
        } else if (keyboardEvent.key === 'ArrowUp') {
          e.preventDefault();
          if (index === 0) {
            const button = content.previousElementSibling as HTMLElement;
            button?.focus();
          } else {
            (items[index - 1] as HTMLElement).focus();
          }
        } else if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          e.preventDefault();
          (item as HTMLAnchorElement).click();
        }
      });
    });
  });
}

export function initializeMobileMenu(): void {
  if (typeof document === 'undefined') return;
  
  try {
    const { mobileMenuButton, mobileMenu } = getNavElements();
    
    if (!mobileMenuButton || !mobileMenu) {
      return;
    }
    
    closeMobileMenu();
    
    const newButton = mobileMenuButton.cloneNode(true) as HTMLElement;
    mobileMenuButton.parentNode?.replaceChild(newButton, mobileMenuButton);
    
    const clickHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleMenuButtonClick(e);
    };
    
    addTrackedListener(newButton, 'click', clickHandler, { capture: true });
    addTrackedListener(newButton, 'touchend', clickHandler, { passive: false, capture: true });
    addTrackedListener(document, 'click', handleOutsideClick, { capture: true });
    addTrackedListener(document, 'keydown', handleKeyboard, { capture: true });
    setupLinkHandlers();
    setupCloseButtonHandler();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Mobile menu initialization error:', error);
    }
  }
}
