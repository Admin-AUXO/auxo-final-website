import type { NavigationState } from './types';

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

