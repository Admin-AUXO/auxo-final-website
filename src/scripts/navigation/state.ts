interface NavigationState {
  openDropdown: HTMLElement | null;
  dropdownLeaveTimer: ReturnType<typeof setTimeout> | null;
  isTransitioning: boolean;
  dropdownHoverState: boolean;
  isMobileMenuOpen: boolean;
  isScrolling: boolean;
  lastScrollTop: number;
}

export const DROPDOWN_ANIMATION_DURATION = 300;
export const DROPDOWN_CLOSE_DELAY = 350;
export const DROPDOWN_LEAVE_DELAY = 400;
export const SCROLL_THRESHOLD = 10;

export const state: NavigationState = {
  openDropdown: null,
  dropdownLeaveTimer: null,
  isTransitioning: false,
  dropdownHoverState: false,
  isMobileMenuOpen: false,
  isScrolling: false,
  lastScrollTop: 0,
};

export const eventListeners: Array<{
  element: EventTarget;
  event: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}> = [];

export function addTrackedListener(
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(event, handler, options);
  eventListeners.push({ element, event, handler, options });
}

export function clearDropdownTimer(): void {
  if (state.dropdownLeaveTimer) {
    clearTimeout(state.dropdownLeaveTimer);
    state.dropdownLeaveTimer = null;
  }
}

export function resetState(): void {
  state.openDropdown = null;
  state.isMobileMenuOpen = false;
  state.dropdownHoverState = false;
  state.isTransitioning = false;
  clearDropdownTimer();
}

