import { BREAKPOINTS } from '../constants';

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
    if (import.meta.env.DEV) console.warn('Nav height update error:', error);
  }
}

function debugNavStacking(): void {
  const nav = document.getElementById('main-navigation');
  if (!nav) return;

  const computedStyle = window.getComputedStyle(nav);
  const zIndex = computedStyle.zIndex;
  const position = computedStyle.position;
  const transform = computedStyle.transform;

  if (import.meta.env.DEV) {
    console.group('🔍 Navigation Stacking Context Debug');
    console.log('Position:', position);
    console.log('Z-index:', zIndex);
    console.log('Transform:', transform);
    console.log('Computed height:', computedStyle.height);
    console.log('Parent stacking context:', nav.parentElement?.style.transform || 'none');
    console.groupEnd();
  }
}

function debugSpecificityOverrides(): void {
  const nav = document.getElementById('main-navigation');
  if (!nav || !import.meta.env.DEV) return;

  const computedStyle = window.getComputedStyle(nav);
  const inlineStyles = nav.getAttribute('style');

  console.group('🎯 Navigation Specificity Debug');
  console.log('Inline styles:', inlineStyles);
  console.log('Computed position:', computedStyle.position);
  console.log('Computed z-index:', computedStyle.zIndex);
  console.log('Computed height:', computedStyle.height);
  console.log('CSS custom properties:', {
    navCurrentHeight: computedStyle.getPropertyValue('--nav-current-height'),
    navScrollPadding: computedStyle.getPropertyValue('--nav-scroll-padding'),
  });
  console.groupEnd();
}

function toggleDebugMode(): void {
  const html = document.documentElement;
  html.classList.toggle('debug-nav');

  if (import.meta.env.DEV) {
    console.log('🔧 Navigation debug mode:', html.classList.contains('debug-nav') ? 'ENABLED' : 'DISABLED');
  }
}

let debugThrottle = 0;

export function debugNavigation(): void {
  if (!import.meta.env.DEV) return;

  const now = Date.now();
  if (now - debugThrottle < 1000) return; // Throttle to once per second
  debugThrottle = now;

  updateNavHeight();
  debugNavStacking();
  debugSpecificityOverrides();
  debugLayoutShifts();
}

function debugLayoutShifts(): void {
  const nav = document.getElementById('main-navigation');
  const main = document.getElementById('main-content');

  if (!nav || !main || !import.meta.env.DEV) return;

  const navHeight = nav.getBoundingClientRect().height;
  const mainPadding = parseFloat(window.getComputedStyle(main).paddingTop);

  console.group('📏 Layout Shift Debug');
  console.log('Navigation height:', navHeight + 'px');
  console.log('Main padding-top:', mainPadding + 'px');
  console.log('Overlap detected:', navHeight > mainPadding);
  console.log('CSS Variables:', {
    navCurrentHeight: getComputedStyle(document.documentElement).getPropertyValue('--nav-current-height'),
    navScrollPadding: getComputedStyle(document.documentElement).getPropertyValue('--nav-scroll-padding'),
  });
  console.groupEnd();
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

let scrollLockCount = 0;
let cachedScrollbarWidth: number | null = null;

function getScrollbarWidth(): number {
  if (cachedScrollbarWidth !== null) {
    return cachedScrollbarWidth;
  }

  cachedScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  return cachedScrollbarWidth;
}

export function lockScroll(): void {
  scrollLockCount++;

  if (scrollLockCount === 1) {
    const lenisInstance = typeof window !== 'undefined' ? (window as any).__lenis : null;
    if (lenisInstance) {
      lenisInstance.stop();
    }

    const isMobile = window.innerWidth < BREAKPOINTS.MD;
    if (!isMobile) {
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}

export function unlockScroll(): void {
  if (scrollLockCount > 0) scrollLockCount--;

  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.removeProperty('--scrollbar-width');
    document.documentElement.style.overflow = '';

    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    const lenisInstance = typeof window !== 'undefined' ? (window as any).__lenis : null;
    if (lenisInstance) {
      lenisInstance.start();
    }
  }
}

export function forceUnlockScroll(): void {
  scrollLockCount = 0;

  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.removeProperty('--scrollbar-width');
  document.documentElement.style.overflow = '';

  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');

  const lenisInstance = typeof window !== 'undefined' ? (window as any).__lenis : null;
  if (lenisInstance) {
    lenisInstance.start();
  }
}

