import { state, addTrackedListener } from './state';
import { getNavElements, resetDropdownStyles, findDropdownContent } from './utils';
import { DROPDOWN_ANIMATION_DURATION, DROPDOWN_CLOSE_DELAY } from './types';
import { createFocusTrap } from 'focus-trap';

// Mobile dropdown animations
function animateDropdownOpen(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  content.classList.remove('hidden');
  content.style.display = 'block';
  content.style.maxHeight = '0';
  content.style.opacity = '0';
  content.style.overflow = 'hidden';

  content.offsetHeight; // Force reflow

  requestAnimationFrame(() => {
    const targetHeight = content.scrollHeight;
    content.style.maxHeight = `${targetHeight}px`;
    content.style.opacity = '1';

    setTimeout(() => {
      resetDropdownStyles(content);
    }, DROPDOWN_ANIMATION_DURATION);
  });

  icon?.classList.add('open');
  buttonEl.setAttribute('aria-expanded', 'true');
}

function animateDropdownClose(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  const currentHeight = content.scrollHeight;
  content.style.maxHeight = `${currentHeight}px`;
  content.style.opacity = '1';
  content.style.overflow = 'hidden';

  content.offsetHeight; // Force reflow

  requestAnimationFrame(() => {
    content.style.maxHeight = '0';
    content.style.opacity = '0';

    setTimeout(() => {
      content.classList.add('hidden');
      resetDropdownStyles(content);
    }, DROPDOWN_CLOSE_DELAY);
  });

  icon?.classList.remove('open');
  buttonEl.setAttribute('aria-expanded', 'false');
}

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

export function setupMobileDropdowns(): void {
  document.querySelectorAll('#mobile-menu .mobile-dropdown-btn').forEach(button => {
    // Skip if already initialized
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

// Focus trap instance
let focusTrap: ReturnType<typeof createFocusTrap> | null = null;

export function closeMobileMenu(): void {
  const { mobileMenu, mobileMenuButton, nav } = getNavElements();

  if (!mobileMenu) return;

  // Skip if already closed
  if (!state.isMobileMenuOpen) return;

  state.isMobileMenuOpen = false;
  
  // Deactivate focus trap
  if (focusTrap) {
    focusTrap.deactivate();
    focusTrap = null;
  }
  
  // Force reflow
  mobileMenu.offsetHeight;
  
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  
  if (nav) {
    nav.removeAttribute('data-menu-open');
  }

  if (mobileMenuButton) {
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    // Return focus to button
    mobileMenuButton.focus();
  }

  document.body.style.overflow = '';

  // Close all dropdowns
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

function setupLinkHandlers(): void {
  const { mobileMenu } = getNavElements();
  if (!mobileMenu) return;
  
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    addTrackedListener(link, 'click', () => {
      closeMobileMenu();
    });
  });
}

function openMobileMenu(): void {
  const { mobileMenu, mobileMenuButton, nav } = getNavElements();

  if (!mobileMenu || !mobileMenuButton) {
    return;
  }

  // Skip if already open
  if (state.isMobileMenuOpen) return;

  state.isMobileMenuOpen = true;
  
  // Force reflow
  mobileMenu.offsetHeight;
  
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  
  if (nav) {
    nav.setAttribute('data-menu-open', 'true');
  }

  mobileMenuButton.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Setup focus trap
  focusTrap = createFocusTrap(mobileMenu, {
    allowOutsideClick: true,
    escapeDeactivates: true,
    returnFocusOnDeactivate: true,
    initialFocus: mobileMenu,
  });
  
  // Activate focus trap
  requestAnimationFrame(() => {
    try {
      focusTrap?.activate();
    } catch (e) {
      // Ignore if no focusable elements
    }
    
    setupMobileDropdowns();
    setupLinkHandlers();
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
  const { nav, mobileMenu } = getNavElements();

  if (!nav || !mobileMenu) return;

  // Skip if clicking inside nav or menu
  if (nav.contains(target) || mobileMenu.contains(target)) {
    return;
  }

  // Close if clicking outside
  if (mobileMenu.classList.contains('is-open')) {
    closeMobileMenu();
  }
}

function handleKeyboard(e: KeyboardEvent): void {
  const { mobileMenu } = getNavElements();
  
  if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) {
    e.preventDefault();
    closeMobileMenu();
  }
}

export function initializeMobileMenu(): void {
  const { mobileMenuButton, mobileMenu } = getNavElements();
  
  if (!mobileMenuButton || !mobileMenu) {
    return;
  }

  // Ensure menu starts closed
  closeMobileMenu();

  // Remove existing listeners
  const newButton = mobileMenuButton.cloneNode(true) as HTMLElement;
  mobileMenuButton.parentNode?.replaceChild(newButton, mobileMenuButton);
  
  // Add click handlers
  const clickHandler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    handleMenuButtonClick(e);
  };

  addTrackedListener(newButton, 'click', clickHandler, { capture: true });
  addTrackedListener(newButton, 'touchend', clickHandler, { passive: false, capture: true });
  
  // Setup global handlers
  addTrackedListener(document, 'click', handleOutsideClick, { capture: true });
  addTrackedListener(document, 'keydown', handleKeyboard as EventListener, { capture: true });

  // Setup link handlers
  setupLinkHandlers();
}
