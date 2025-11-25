export interface NavigationState {
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

