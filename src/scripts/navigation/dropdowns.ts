import { state, addTrackedListener, clearDropdownTimer } from './state';
import { DROPDOWN_LEAVE_DELAY } from './types';
import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

// AutoUpdate cleanup functions
const autoUpdateCleanups = new Map<HTMLElement, () => void>();

function updateDropdownPosition(button: HTMLElement, menu: HTMLElement): void {
  const existingCleanup = autoUpdateCleanups.get(menu);
  if (existingCleanup) {
    existingCleanup();
  }
  computePosition(button, menu, {
    placement: 'bottom-start' as Placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 16 }),
    ],
  }).then(({ x, y, placement }) => {
    Object.assign(menu.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
    menu.classList.remove('dropdown-right-aligned');
    if (placement.includes('end') || placement.includes('right')) {
      menu.classList.add('dropdown-right-aligned');
    }
    });
  const cleanup = autoUpdate(button, menu, () => {
    computePosition(button, menu, {
      placement: 'bottom-start' as Placement,
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 16 }),
      ],
    }).then(({ x, y, placement }) => {
      Object.assign(menu.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      menu.classList.remove('dropdown-right-aligned');
      if (placement.includes('end') || placement.includes('right')) {
        menu.classList.add('dropdown-right-aligned');
      }
    });
  });

  autoUpdateCleanups.set(menu, cleanup);
}

function closeDropdown(dropdown: HTMLElement): void {
  if (state.isTransitioning) return;

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const menu = dropdown.querySelector(isModal ? '.dropdown-modal-menu' : '.dropdown-menu') as HTMLElement;
  const button = dropdown.querySelector('.dropdown-toggle') as HTMLElement;
  const arrow = dropdown.querySelector('.dropdown-arrow') as HTMLElement;
  const overlay = dropdown.querySelector('.dropdown-modal-overlay') as HTMLElement;

  if (menu && button && arrow) {
    // Clean up autoUpdate
    const cleanup = autoUpdateCleanups.get(menu);
    if (cleanup) {
      cleanup();
      autoUpdateCleanups.delete(menu);
    }

    menu.classList.remove('open');
    button.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    arrow.classList.remove('open');
    
    // Reset position styles
    menu.style.left = '';
    menu.style.top = '';
    
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    
    if (isModal) {
      document.body.style.overflow = '';
    }
    
    if (state.openDropdown === dropdown) {
      state.openDropdown = null;
    }
  }
}

function openDropdownMenu(dropdown: HTMLElement): void {
  if (state.openDropdown && state.openDropdown !== dropdown) {
    closeDropdown(state.openDropdown);
  }

  const isModal = dropdown.hasAttribute('data-modal-dropdown');
  const menu = dropdown.querySelector(isModal ? '.dropdown-modal-menu' : '.dropdown-menu') as HTMLElement;
  const button = dropdown.querySelector('.dropdown-toggle') as HTMLElement;
  const arrow = dropdown.querySelector('.dropdown-arrow') as HTMLElement;
  const overlay = dropdown.querySelector('.dropdown-modal-overlay') as HTMLElement;

  if (!menu || !button || !arrow) return;

  menu.classList.add('open');
  button.classList.add('active');
  button.setAttribute('aria-expanded', 'true');
  arrow.classList.add('open');
  
  if (isModal && overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    } else {
    // Use Floating UI for positioning
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

export function initializeDropdowns(): void {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    const newToggle = toggle.cloneNode(true) as HTMLElement;
    toggle.parentNode?.replaceChild(newToggle, toggle);

    addTrackedListener(newToggle, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = newToggle.closest('.dropdown-container') as HTMLElement;
      if (!dropdown) return;

      const isModal = dropdown.hasAttribute('data-modal-dropdown');
      const menu = dropdown.querySelector(isModal ? '.dropdown-modal-menu' : '.dropdown-menu') as HTMLElement;
      if (!menu) return;

      const isOpen = menu.classList.contains('open');

      if (isOpen) {
        closeDropdown(dropdown);
      } else {
        openDropdownMenu(dropdown);
      }
    }, { capture: false });
  });

  // Handle overlay clicks
  document.querySelectorAll('.dropdown-modal-overlay').forEach(overlay => {
    addTrackedListener(overlay, 'click', () => {
      const dropdown = overlay.closest('.dropdown-container') as HTMLElement;
      if (dropdown) {
        closeDropdown(dropdown);
      }
    });
  });

  // Handle close button clicks
  document.querySelectorAll('[data-dropdown-close]').forEach(closeBtn => {
    addTrackedListener(closeBtn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = (closeBtn as HTMLElement).getAttribute('data-dropdown-close');
      if (index) {
        const dropdown = document.querySelector(`[data-nav-item="${index}"]`) as HTMLElement;
        if (dropdown) {
          closeDropdown(dropdown);
        }
      }
    });
  });

  document.querySelectorAll('.dropdown-container').forEach(container => {
    const containerEl = container as HTMLElement;
    const isModal = containerEl.hasAttribute('data-modal-dropdown');
    const menu = containerEl.querySelector(isModal ? '.dropdown-modal-menu' : '.dropdown-menu') as HTMLElement;

    // Apply hover behavior for non-modal dropdowns
    if (!isModal) {
      addTrackedListener(containerEl, 'mouseleave', (e) => {
        if (state.openDropdown === containerEl && !state.isTransitioning) {
          const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
          if (relatedTarget && menu?.contains(relatedTarget)) return;
          scheduleDropdownClose(containerEl);
        }
      });

      addTrackedListener(containerEl, 'mouseenter', () => {
        clearDropdownTimer();
        state.dropdownHoverState = true;
      });

      if (menu) {
        addTrackedListener(menu, 'mouseenter', () => {
          clearDropdownTimer();
          state.dropdownHoverState = true;
        });

        addTrackedListener(menu, 'mouseleave', (e) => {
          const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
          if (relatedTarget && containerEl.contains(relatedTarget)) return;

          state.dropdownHoverState = false;
          if (state.openDropdown === containerEl && !state.isTransitioning) {
            scheduleDropdownClose(containerEl);
          }
        });
      }
    }
  });
}

export function closeAllDropdowns(): void {
  if (state.openDropdown) {
    closeDropdown(state.openDropdown);
  }
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

