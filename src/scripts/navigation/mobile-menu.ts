import { state, addTrackedListener } from './state';
import { getNavElements, resetDropdownStyles, findDropdownContent, lockScroll, unlockScroll } from './utils';
import { DROPDOWN_ANIMATION_DURATION, DROPDOWN_CLOSE_DELAY } from './state';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

let focusTrapCleanup: (() => void) | null = null;
let returnFocusElement: HTMLElement | null = null;
let swipeCleanup: (() => void) | null = null;

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
        const scrollHeight = innerDiv.scrollHeight;
        return scrollHeight + marginTop + marginBottom;
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
      const el = item as HTMLElement;
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
      const wrapper = buttonEl.closest('.mobile-dropdown-wrapper') as HTMLElement;
      if (!menuContent || !wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const menuRect = menuContent.getBoundingClientRect();
      const padding = 24;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      if (!isTouch) {
        if (wrapperRect.top < menuRect.top + padding) {
          const scrollAmount = menuContent.scrollTop + (wrapperRect.top - menuRect.top) - padding;
          menuContent.scrollTo({ top: Math.max(0, scrollAmount), behavior: 'smooth' });
        } else if (wrapperRect.bottom > menuRect.bottom - padding) {
          const scrollAmount = menuContent.scrollTop + (wrapperRect.bottom - menuRect.bottom) + padding;
          menuContent.scrollTo({ top: Math.min(menuContent.scrollHeight - menuContent.clientHeight, scrollAmount), behavior: 'smooth' });
        }
      } else if (wrapperRect.top < menuRect.top) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  isHidden ? animateDropdownOpen(content, icon, buttonEl) : animateDropdownClose(content, icon, buttonEl);
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

function createFocusTrap(container: HTMLElement, returnFocus: HTMLElement): void {
  returnFocusElement = returnFocus;

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(el => !el.hasAttribute('disabled'));

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  focusTrapCleanup = () => {
    container.removeEventListener('keydown', handleTabKey);
  };

  requestAnimationFrame(() => {
    firstFocusable?.focus();
  });
}

function deactivateFocusTrap(): void {
  if (focusTrapCleanup) {
    focusTrapCleanup();
    focusTrapCleanup = null;
  }

  if (returnFocusElement) {
    returnFocusElement.focus();
    returnFocusElement = null;
  }
}

function resetMobileDropdowns(): void {
  document.querySelectorAll('#mobile-menu .mobile-dropdown-content').forEach(content => {
    const button = content.previousElementSibling as HTMLElement;
    if (!button?.classList.contains('mobile-dropdown-btn')) return;

    resetDropdownStyles(content as HTMLElement);
    content.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
    button.querySelector('.dropdown-arrow-mobile')?.classList.remove('open');
  });
}

export function closeMobileMenu(): void {
  const { mobileMenu, mobileMenuButton, mobileMenuOverlay, nav } = getNavElements();
  
  if (!mobileMenu || !state.isMobileMenuOpen) return;
  
  state.isMobileMenuOpen = false;
  deactivateFocusTrap();

  if (swipeCleanup) {
    swipeCleanup();
    swipeCleanup = null;
  }

  const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
  if (menuContent) {
    menuContent.removeEventListener('scroll', updateScrollIndicators);
    menuContent.classList.remove('scrollable-top', 'scrollable-bottom');
    menuContent.removeAttribute('data-lenis-prevent');
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

  const isScrollableTop = scrollTop > threshold;
  const isScrollableBottom = scrollTop + clientHeight < scrollHeight - threshold;

  menuContent.classList.toggle('scrollable-top', isScrollableTop);
  menuContent.classList.toggle('scrollable-bottom', isScrollableBottom);
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

  createFocusTrap(mobileMenu, mobileMenuButton);

  requestAnimationFrame(() => {
    setupMobileDropdowns();
    setupLinkHandlers();
    setupCloseButtonHandler();
    setupDropdownKeyboardNavigation();
    setupSwipeHandlers();

    const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
    if (menuContent) {
      menuContent.addEventListener('scroll', updateScrollIndicators, { passive: true });
      menuContent.setAttribute('data-lenis-prevent', 'true');
      updateScrollIndicators();
    }
  });
}

export function toggleMobileMenu(): void {
  const { mobileMenu } = getNavElements();
  if (!mobileMenu) return;

  mobileMenu.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
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

  if (swipeCleanup) {
    swipeCleanup();
    swipeCleanup = null;
  }

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isDragging = false;

  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
    isDragging = false;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaX > 10 || deltaY > 10) {
        isDragging = true;
      }
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const deltaTime = Date.now() - startTime;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (deltaX > 0) {
      const swipeDistance = Math.abs(deltaX);
      const swipeVelocity = Math.abs(deltaX / deltaTime);

      if (swipeDistance > SWIPE_DISTANCE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
        closeMobileMenu();
      }
    }

    isDragging = false;
  };

  mobileMenu.addEventListener('pointerdown', handlePointerDown);
  mobileMenu.addEventListener('pointermove', handlePointerMove);
  mobileMenu.addEventListener('pointerup', handlePointerUp);
  mobileMenu.addEventListener('pointercancel', handlePointerUp);

  swipeCleanup = () => {
    mobileMenu.removeEventListener('pointerdown', handlePointerDown);
    mobileMenu.removeEventListener('pointermove', handlePointerMove);
    mobileMenu.removeEventListener('pointerup', handlePointerUp);
    mobileMenu.removeEventListener('pointercancel', handlePointerUp);
  };
}

function handleKeyboard(e: Event): void {
  const keyboardEvent = e as KeyboardEvent;

  if (keyboardEvent.key === 'Escape') {
    const { mobileMenu } = getNavElements();
    if (mobileMenu?.classList.contains('is-open')) {
      e.preventDefault();
      closeMobileMenu();
    }
    return;
  }

  if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement?.classList.contains('mobile-dropdown-btn')) return;

    e.preventDefault();
    const content = findDropdownContent(activeElement);
    if (content?.classList.contains('dropdown-opening')) {
      const firstItem = content.querySelector('.mobile-nav-link') as HTMLElement;
      firstItem?.focus();
    } else {
      toggleMobileDropdown(activeElement);
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
