import { DragGesture } from '@use-gesture/vanilla';
import { state, addTrackedListener } from './state';
import { getNavElements, resetDropdownStyles, findDropdownContent, lockScroll, unlockScroll } from './utils';
import { DROPDOWN_ANIMATION_DURATION, DROPDOWN_CLOSE_DELAY } from './state';
import { createFocusTrap } from 'focus-trap';

let focusTrap: ReturnType<typeof createFocusTrap> | null = null;
let swipeGesture: DragGesture | null = null;

function calculateDropdownHeight(content: HTMLElement): number {
  const styles = {
    display: content.style.display,
    maxHeight: content.style.maxHeight,
    visibility: content.style.visibility,
    overflow: content.style.overflow,
    opacity: content.style.opacity,
  };
  
  Object.assign(content.style, {
    display: 'block',
    maxHeight: 'none',
    visibility: 'hidden',
    overflow: 'visible',
    opacity: '0',
    height: 'auto',
  });
  
  void content.offsetHeight;

  const innerDiv = content.querySelector('div:first-child');
  const height = innerDiv
    ? (() => {
        const computed = window.getComputedStyle(innerDiv);
        const marginTop = parseFloat(computed.marginTop) || 0;
        const marginBottom = parseFloat(computed.marginBottom) || 0;
        return innerDiv.scrollHeight + marginTop + marginBottom;
      })()
    : content.scrollHeight;
  
  Object.assign(content.style, styles);
  return Math.ceil(height) + 1;
}

function animateDropdownOpen(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  content.classList.remove('hidden');
  content.style.display = 'block';
  
  const targetHeight = calculateDropdownHeight(content);
  content.style.setProperty('--dropdown-max-height', `${targetHeight}px`);
  content.classList.remove('dropdown-opening', 'dropdown-closing');
  
  requestAnimationFrame(() => {
    content.classList.add('dropdown-opening');
    
    const childItems = content.querySelectorAll('.mobile-nav-link');
    childItems.forEach((item) => {
      (item as HTMLElement).style.opacity = '1';
      (item as HTMLElement).style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
      if (menuContent) {
        const wrapper = buttonEl.closest('.mobile-dropdown-wrapper') as HTMLElement;
        if (wrapper) {
          const wrapperRect = wrapper.getBoundingClientRect();
          const menuRect = menuContent.getBoundingClientRect();
          const padding = 24;
          
          if (wrapperRect.top < menuRect.top + padding) {
            const scrollAmount = menuContent.scrollTop + (wrapperRect.top - menuRect.top) - padding;
            menuContent.scrollTo({
              top: Math.max(0, scrollAmount),
              behavior: 'smooth'
            });
          } else if (wrapperRect.bottom > menuRect.bottom - padding) {
            const scrollAmount = menuContent.scrollTop + (wrapperRect.bottom - menuRect.bottom) + padding;
            menuContent.scrollTo({
              top: Math.min(menuContent.scrollHeight - menuContent.clientHeight, scrollAmount),
              behavior: 'smooth'
            });
          }
        }
      }
    }, 150);
    
    setTimeout(() => resetDropdownStyles(content), DROPDOWN_ANIMATION_DURATION);
  });
  
  icon?.classList.add('open');
  buttonEl.setAttribute('aria-expanded', 'true');
}

function animateDropdownClose(content: HTMLElement, icon: Element | null, buttonEl: HTMLElement): void {
  const currentHeight = content.scrollHeight;
  content.style.setProperty('--dropdown-max-height', `${currentHeight}px`);
  
  content.classList.remove('dropdown-opening', 'dropdown-closing');
  content.classList.add('dropdown-opening');
  
  void content.offsetHeight;
  
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
    const btnEl = button as HTMLElement;
    if (btnEl.dataset.initialized === 'true') return;

    const handler = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileDropdown(btnEl);
    };

    addTrackedListener(btnEl, 'click', handler, { capture: true });
    addTrackedListener(btnEl, 'touchend', handler, { capture: true, passive: false });
    btnEl.dataset.initialized = 'true';
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
    const button = content.previousElementSibling as HTMLElement;
    if (button?.classList.contains('mobile-dropdown-btn')) {
      resetDropdownStyles(content as HTMLElement);
      content.classList.add('hidden');
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
  
  if (swipeGesture) {
    swipeGesture.destroy();
    swipeGesture = null;
  }
  
  const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
  if (menuContent) {
    menuContent.removeEventListener('scroll', updateScrollIndicators);
    menuContent.classList.remove('scrollable-top', 'scrollable-bottom');
  }
  
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

function updateScrollIndicators(): void {
  const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
  if (!menuContent) return;

  const scrollTop = menuContent.scrollTop;
  const scrollHeight = menuContent.scrollHeight;
  const clientHeight = menuContent.clientHeight;
  const threshold = 10;

  menuContent.classList.toggle('scrollable-top', scrollTop > threshold);
  menuContent.classList.toggle('scrollable-bottom', scrollTop + clientHeight < scrollHeight - threshold);
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
    } catch {
      // Ignore focus trap errors
    }
    
    setupMobileDropdowns();
    setupLinkHandlers();
    setupCloseButtonHandler();
    setupDropdownKeyboardNavigation();
    setupSwipeHandlers();
    
    const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
    if (menuContent) {
      menuContent.addEventListener('scroll', updateScrollIndicators, { passive: true });
      updateScrollIndicators();
    }
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

const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

function setupSwipeHandlers(): void {
  const { mobileMenu } = getNavElements();
  if (!mobileMenu) return;

  if (swipeGesture) {
    swipeGesture.destroy();
    swipeGesture = null;
  }

  swipeGesture = new DragGesture(
    mobileMenu,
    ({ active, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy] }) => {
      if (Math.abs(dx) < Math.abs(dy)) return;
      
      if (!active && dx > 0) {
        const swipeDistance = Math.abs(mx);
        const swipeVelocity = Math.abs(vx);
        
        if (swipeDistance > SWIPE_DISTANCE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
          closeMobileMenu();
        }
      }
    },
    {
      axis: 'x',
      threshold: 10,
      filterTaps: true,
      pointer: { touch: true },
    }
  );
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

  const buttons = [mobileMenuCloseBtn, mobileMenuCloseBtnHeader].filter(Boolean);

  buttons.forEach(btn => {
    const element = btn as HTMLElement;
    if (element.dataset.initialized !== 'true') {
      addTrackedListener(element, 'click', handler, { capture: true });
      addTrackedListener(element, 'touchend', handler, { passive: false, capture: true });
      element.dataset.initialized = 'true';
    }
  });
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

  const { mobileMenuButton, mobileMenu } = getNavElements();
  if (!mobileMenuButton || !mobileMenu) return;

  closeMobileMenu();
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');

  addTrackedListener(mobileMenuButton, 'click', handleMenuButtonClick, { capture: true });
  addTrackedListener(mobileMenuButton, 'touchend', handleMenuButtonClick, { passive: false, capture: true });
  addTrackedListener(document, 'click', handleOutsideClick, { capture: true });
  addTrackedListener(document, 'keydown', handleKeyboard, { capture: true });

  setupLinkHandlers();
  setupCloseButtonHandler();
}
