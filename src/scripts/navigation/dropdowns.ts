import { state, addTrackedListener, clearDropdownTimer } from './state';
import { DROPDOWN_LEAVE_DELAY } from './types';
import { lockScroll, unlockScroll } from './utils';
import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

const autoUpdateCleanups = new Map<HTMLElement, () => void>();

const DROPDOWN_POSITION_CONFIG = {
  placement: 'bottom-start' as Placement,
  middleware: [offset(8), flip(), shift({ padding: 16 })],
};

const SELECTORS = {
  MODAL_MENU: '.dropdown-modal-menu',
  STANDARD_MENU: '.dropdown-menu',
  TOGGLE: '.dropdown-toggle',
  ARROW: '.dropdown-arrow',
  OVERLAY: '.dropdown-modal-overlay',
} as const;

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
  if (state.isTransitioning) return;

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const { menu, button, arrow, overlay } = getDropdownElements(dropdown, isModal);

  if (!menu || !button || !arrow) return;

  const cleanup = autoUpdateCleanups.get(menu);
  cleanup?.();
  autoUpdateCleanups.delete(menu);

  menu.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
  arrow.classList.remove('open');
  menu.style.cssText = '';
  overlay?.classList.remove('open');
  overlay?.setAttribute('aria-hidden', 'true');
  
  if (isModal) unlockScroll();
  if (state.openDropdown === dropdown) state.openDropdown = null;
}

function openDropdownMenu(dropdown: HTMLElement): void {
  if (state.openDropdown && state.openDropdown !== dropdown) {
    closeDropdown(state.openDropdown);
  }

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const { menu, button, arrow, overlay } = getDropdownElements(dropdown, isModal);

  if (!menu || !button || !arrow) return;

  menu.classList.add('open');
  button.setAttribute('aria-expanded', 'true');
  arrow.classList.add('open');
  
  if (isModal && overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
  } else {
    updateDropdownPosition(button, menu);
  }
  
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
  const newToggle = toggle.cloneNode(true) as HTMLElement;
  toggle.parentNode?.replaceChild(newToggle, toggle);

  addTrackedListener(newToggle, 'click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropdown = newToggle.closest('.dropdown-container') as HTMLElement;
    if (!dropdown) return;

    const isModal = dropdown.hasAttribute('data-modal-dropdown');
    const menu = dropdown.querySelector(isModal ? SELECTORS.MODAL_MENU : SELECTORS.STANDARD_MENU) as HTMLElement;
    if (!menu) return;

    menu.classList.contains('open') ? closeDropdown(dropdown) : openDropdownMenu(dropdown);
  });
}

function setupHoverHandlers(container: HTMLElement, menu: HTMLElement): void {
  const handleMouseEnter = () => {
    clearDropdownTimer();
    state.dropdownHoverState = true;
  };

  const handleContainerMouseLeave = (e: Event) => {
    if (state.openDropdown === container && !state.isTransitioning) {
      const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
      if (relatedTarget && menu?.contains(relatedTarget)) return;
      scheduleDropdownClose(container);
    }
  };

  const handleMenuMouseLeave = (e: Event) => {
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
    if (relatedTarget && (menu?.contains(relatedTarget) || container.contains(relatedTarget))) return;
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
  
  try {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => 
      setupToggleClickHandler(toggle as HTMLElement)
    );

    document.querySelectorAll('.dropdown-modal-overlay').forEach(overlay => {
      addTrackedListener(overlay, 'click', () => {
        const dropdown = overlay.closest('.dropdown-container') as HTMLElement;
        if (dropdown) closeDropdown(dropdown);
      });
    });

    document.querySelectorAll('[data-dropdown-close]').forEach(closeBtn => {
      addTrackedListener(closeBtn, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = (closeBtn as HTMLElement).getAttribute('data-dropdown-close');
        if (index) {
          const dropdown = document.querySelector(`[data-nav-item="${index}"]`) as HTMLElement;
          if (dropdown) closeDropdown(dropdown);
        }
      });
    });

    document.querySelectorAll('.dropdown-container').forEach(container => {
      const containerEl = container as HTMLElement;
      const isModal = containerEl.hasAttribute('data-modal-dropdown');
      const menu = containerEl.querySelector(isModal ? SELECTORS.MODAL_MENU : SELECTORS.STANDARD_MENU) as HTMLElement;
      if (!isModal && menu) {
        setupHoverHandlers(containerEl, menu);
      }
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Dropdown initialization error:', error);
    }
  }
}

export function closeAllDropdowns(): void {
  if (state.openDropdown) closeDropdown(state.openDropdown);
}

export function setupDropdownCloseHandlers(): void {
  addTrackedListener(document, 'click', (e) => {
    const target = e.target as HTMLElement;
    if (state.openDropdown && !state.openDropdown.contains(target)) {
      closeDropdown(state.openDropdown);
    }
  });

  addTrackedListener(document, 'keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape' && state.openDropdown) {
      closeDropdown(state.openDropdown);
    }
  });
}

