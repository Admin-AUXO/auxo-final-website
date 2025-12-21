import { state, addTrackedListener, clearDropdownTimer, DROPDOWN_LEAVE_DELAY } from './state';
import { lockScroll, unlockScroll } from './utils';
import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

const autoUpdateCleanups = new Map<HTMLElement, () => void>();

const DROPDOWN_POSITION_CONFIG = {
  placement: 'bottom-start' as Placement,
  middleware: [offset(8), flip(), shift({ padding: 16 })],
};

const SELECTORS = {
  MODAL_MENU: '[data-dropdown-menu]',
  STANDARD_MENU: '.dropdown-menu',
  TOGGLE: '.dropdown-toggle',
  ARROW: '.dropdown-arrow, .dropdown-chevron',
  OVERLAY: '.dropdown-modal-overlay',
} as const;

const STANDARD_DROPDOWN_ANIMATION_DURATION = 400;
const MODAL_DROPDOWN_ANIMATION_DURATION = 400;

function applyPosition({ x, y, placement }: { x: number; y: number; placement: string }, menu: HTMLElement): void {
  Object.assign(menu.style, { left: `${x}px`, top: `${y}px` });
  menu.classList.toggle('dropdown-right-aligned', placement.includes('end') || placement.includes('right'));
}

function updateDropdownPosition(button: HTMLElement, menu: HTMLElement): void {
  const existingCleanup = autoUpdateCleanups.get(menu);
  existingCleanup?.();

  computePosition(button, menu, DROPDOWN_POSITION_CONFIG).then((pos) => applyPosition(pos, menu));

  const cleanup = autoUpdate(button, menu, () => {
    computePosition(button, menu, DROPDOWN_POSITION_CONFIG).then((pos) => applyPosition(pos, menu));
  });

  autoUpdateCleanups.set(menu, cleanup);
}

function getDropdownElements(dropdown: HTMLElement, isModal: boolean) {
  return {
    menu: dropdown.querySelector(isModal ? SELECTORS.MODAL_MENU : SELECTORS.STANDARD_MENU) as HTMLElement,
    button: dropdown.querySelector(SELECTORS.TOGGLE) as HTMLElement,
    arrow: dropdown.querySelector(SELECTORS.ARROW) as HTMLElement,
    overlay: dropdown.querySelector(SELECTORS.OVERLAY) as HTMLElement,
  };
}

function closeDropdown(dropdown: HTMLElement): void {
  // Prevent multiple close operations
  if (state.isTransitioning) return;

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const { menu, button, arrow, overlay } = getDropdownElements(dropdown, isModal);

  // Ensure we have the required elements
  if (!menu) return;

  // Clean up positioning
  autoUpdateCleanups.get(menu)?.();
  autoUpdateCleanups.delete(menu);

  // Mark as transitioning to prevent conflicts
  state.isTransitioning = true;

  // Remove open classes
  menu.classList.remove('open');
  button?.classList.remove('open');
  arrow?.classList.remove('open');
  overlay?.classList.remove('open');

    // Keep modal elements below navigation when closed
    if (isModal) {
      if (overlay) overlay.style.setProperty('z-index', '1');
      if (menu) menu.style.setProperty('z-index', '1');
    }

  // Update ARIA attributes
  button?.setAttribute('aria-expanded', 'false');
  overlay?.setAttribute('aria-hidden', 'true');

  // Update body class for modal dropdowns
  if (isModal) {
    document.body.classList.remove('dropdown-open');
  }

  // Reset state
  if (state.openDropdown === dropdown) {
    state.openDropdown = null;
  }
  state.dropdownHoverState = false;

  const duration = isModal ? MODAL_DROPDOWN_ANIMATION_DURATION : STANDARD_DROPDOWN_ANIMATION_DURATION;

  // Use requestAnimationFrame to ensure DOM updates
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Reset inline styles
      if (menu) menu.style.cssText = '';
      // Unlock scroll for modal dropdowns
      if (isModal) unlockScroll();
      // Allow new transitions
      state.isTransitioning = false;
    }, duration);
  });
}

function openDropdownMenu(dropdown: HTMLElement): void {
  if (state.openDropdown && state.openDropdown !== dropdown) {
    closeDropdown(state.openDropdown);
  }

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const { menu, button, arrow, overlay } = getDropdownElements(dropdown, isModal);

  if (!menu || !button || !arrow) return;

  state.isTransitioning = true;

  if (isModal && overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    document.body.classList.add('dropdown-open');
  } else {
    updateDropdownPosition(button, menu);
  }

  requestAnimationFrame(() => {
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    arrow.classList.add('open');

    // Reset modal z-index for proper layering when open
    if (isModal) {
      if (overlay) overlay.style.removeProperty('z-index');
      if (menu) menu.style.removeProperty('z-index');
    }

    setTimeout(() => state.isTransitioning = false,
      isModal ? MODAL_DROPDOWN_ANIMATION_DURATION : STANDARD_DROPDOWN_ANIMATION_DURATION);
  });

  state.openDropdown = dropdown;
  state.dropdownHoverState = true;
}

function scheduleDropdownClose(dropdown: HTMLElement): void {
  clearDropdownTimer();
  state.dropdownLeaveTimer = setTimeout(() => {
    if (!state.dropdownHoverState && state.openDropdown === dropdown) {
      closeDropdown(dropdown);
    }
  }, DROPDOWN_LEAVE_DELAY);
}

function setupToggleClickHandler(toggle: HTMLElement): void {
  addTrackedListener(toggle, 'click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const dropdown = toggle.closest('.dropdown-container') as HTMLElement;
    if (!dropdown) return;

    const isModal = dropdown.hasAttribute('data-modal-dropdown');
    const menuSelector = isModal ? SELECTORS.MODAL_MENU : SELECTORS.STANDARD_MENU;
    const menu = dropdown.querySelector(menuSelector) as HTMLElement;
    if (!menu) return;

    const isCurrentlyOpen = menu.classList.contains('open');
    
    if (isCurrentlyOpen) {
      closeDropdown(dropdown);
    } else {
      openDropdownMenu(dropdown);
    }
  }, { capture: true });
}

function setupHoverHandlers(container: HTMLElement, menu: HTMLElement): void {
  const handleMouseEnter = () => {
    clearDropdownTimer();
    state.dropdownHoverState = true;
  };

  const handleContainerMouseLeave = (e: Event) => {
    if (state.openDropdown === container && !state.isTransitioning) {
      const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
      if (relatedTarget && menu.contains(relatedTarget)) return;
      scheduleDropdownClose(container);
    }
  };

  const handleMenuMouseLeave = (e: Event) => {
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
    if (relatedTarget && (menu.contains(relatedTarget) || container.contains(relatedTarget))) return;
    if (state.openDropdown === container && !state.isTransitioning) {
      state.dropdownHoverState = false;
      scheduleDropdownClose(container);
    }
  };

  addTrackedListener(container, 'mouseenter', handleMouseEnter);
  addTrackedListener(container, 'mouseleave', handleContainerMouseLeave);
  addTrackedListener(menu, 'mouseenter', handleMouseEnter);
  addTrackedListener(menu, 'mouseleave', handleMenuMouseLeave);
}

export function initializeDropdowns(): void {
  if (typeof document === 'undefined') return;

  // Ensure all dropdowns start in closed state
  document.querySelectorAll('.dropdown-container').forEach(container => {
    const containerEl = container as HTMLElement;
    const isModal = containerEl.hasAttribute('data-modal-dropdown');
    const { menu, button, arrow, overlay } = getDropdownElements(containerEl, isModal);

    // Force closed state on initialization
    menu?.classList.remove('open');
    button?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    arrow?.classList.remove('open');
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');

    // Initialize modal elements below navigation
    if (isModal) {
      if (overlay) overlay.style.setProperty('z-index', '1');
      if (menu) menu.style.setProperty('z-index', '1');
      document.body.classList.remove('dropdown-open');
    }
  });

  document.querySelectorAll(SELECTORS.TOGGLE).forEach(toggle => {
    setupToggleClickHandler(toggle as HTMLElement);
  });

  document.querySelectorAll(SELECTORS.OVERLAY).forEach(overlay => {
    addTrackedListener(overlay, 'click', (e) => {
      e.stopPropagation();
      const dropdown = overlay.closest('.dropdown-container') as HTMLElement;
      if (dropdown) closeDropdown(dropdown);
    });
  });

  document.querySelectorAll('.dropdown-container').forEach(container => {
    const containerEl = container as HTMLElement;
    const isModal = containerEl.hasAttribute('data-modal-dropdown');
    const menu = containerEl.querySelector(isModal ? SELECTORS.MODAL_MENU : SELECTORS.STANDARD_MENU) as HTMLElement;
    if (!isModal && menu) setupHoverHandlers(containerEl, menu);
  });
}

export function closeAllDropdowns(): void {
  if (state.openDropdown) closeDropdown(state.openDropdown);
}

export function setupDropdownCloseHandlers(): void {
  addTrackedListener(document, 'click', (e) => {
    const target = e.target as HTMLElement;
    if (!state.openDropdown) return;

    const isToggle = target.closest(SELECTORS.TOGGLE);
    const isOverlay = target.closest(SELECTORS.OVERLAY);
    const isDropdownContent = target.closest('.dropdown-modal-content, .dropdown-menu');

    if (isToggle || isOverlay || isDropdownContent) return;
    if (!state.openDropdown.contains(target)) {
      closeDropdown(state.openDropdown);
    }
  }, { capture: false });

  addTrackedListener(document, 'keydown', (e) => {
    const keyboardEvent = e as KeyboardEvent;
    
    if (keyboardEvent.key === 'Escape' && state.openDropdown) {
      closeDropdown(state.openDropdown);
      return;
    }

    if (!state.openDropdown) return;

    const isModal = state.openDropdown.hasAttribute('data-modal-dropdown');
    const { menu } = getDropdownElements(state.openDropdown, isModal);
    if (!menu) return;

    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (keyboardEvent.key === 'ArrowDown') {
      e.preventDefault();
      if (activeElement === state.openDropdown.querySelector(SELECTORS.TOGGLE)) {
        firstElement?.focus();
      } else {
        const currentIndex = Array.from(focusableElements).indexOf(activeElement);
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        focusableElements[nextIndex]?.focus();
      }
    } else if (keyboardEvent.key === 'ArrowUp') {
      e.preventDefault();
      if (activeElement === state.openDropdown.querySelector(SELECTORS.TOGGLE)) {
        lastElement?.focus();
      } else {
        const currentIndex = Array.from(focusableElements).indexOf(activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        focusableElements[prevIndex]?.focus();
      }
    } else if (keyboardEvent.key === 'Home') {
      e.preventDefault();
      firstElement?.focus();
    } else if (keyboardEvent.key === 'End') {
      e.preventDefault();
      lastElement?.focus();
    } else if (keyboardEvent.key === 'Tab' && !keyboardEvent.shiftKey) {
      if (activeElement === lastElement) {
        e.preventDefault();
        closeDropdown(state.openDropdown);
        const nextFocusable = document.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        nextFocusable?.focus();
      }
    } else if (keyboardEvent.key === 'Tab' && keyboardEvent.shiftKey) {
      if (activeElement === firstElement) {
        e.preventDefault();
        closeDropdown(state.openDropdown);
        state.openDropdown.querySelector<HTMLElement>(SELECTORS.TOGGLE)?.focus();
      }
    }
  });
}
