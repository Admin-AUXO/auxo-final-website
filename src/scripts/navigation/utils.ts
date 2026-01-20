import { BREAKPOINTS } from '../constants';
import { logger } from '@/lib/logger';

export function updateNavHeight(): void {
  try {
    const nav = document.getElementById('main-navigation');
    if (!nav) return;

    const computedStyle = window.getComputedStyle(nav);
    const currentHeight = computedStyle.height;

    if (currentHeight && currentHeight !== 'auto') {
      document.documentElement.style.setProperty('--nav-current-height', currentHeight);
    }
  } catch (error) {
    logger.warn('Nav height update error:', error);
  }
}

export function getNavElements() {
  if (typeof document === 'undefined') {
    return {
      nav: null,
      mobileMenu: null,
      mobileMenuButton: null,
      mobileMenuOverlay: null,
      mobileMenuCloseBtn: null,
      mobileMenuCloseBtnHeader: null,
      menuOpen: null,
      menuClose: null,
      logoLink: null,
    };
  }

  return {
    nav: document.getElementById('main-navigation'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileMenuButton: document.getElementById('mobile-menu-button'),
    mobileMenuOverlay: document.getElementById('mobile-menu-overlay'),
    mobileMenuCloseBtn: document.getElementById('mobile-menu-close'),
    mobileMenuCloseBtnHeader: document.getElementById('mobile-menu-close-header'),
    menuOpen: document.querySelector('.menu-open'),
    menuClose: document.querySelector('.menu-close'),
    logoLink: document.querySelector('[data-nav-home]') as HTMLAnchorElement | null,
  };
}

export function resetDropdownStyles(content: HTMLElement): void {
  content.style.maxHeight = '';
  content.style.opacity = '';
  content.style.overflow = '';
  content.style.display = '';

  const childItems = content.querySelectorAll('.mobile-nav-link');
  childItems.forEach((item) => {
    (item as HTMLElement).style.opacity = '';
    (item as HTMLElement).style.transform = '';
  });
}

export function findDropdownContent(buttonEl: HTMLElement): HTMLElement | null {
  let content = buttonEl.nextElementSibling as HTMLElement;
  if (!content?.classList.contains('mobile-dropdown-content')) {
    content = buttonEl.parentElement?.querySelector('.mobile-dropdown-content') as HTMLElement || null;
  }
  return content?.classList.contains('mobile-dropdown-content') ? content : null;
}

export { lockScroll, unlockScroll, forceUnlockScroll, scrollLock } from '../core/scrollLock';

