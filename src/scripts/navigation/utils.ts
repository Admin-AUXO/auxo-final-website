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

    const isMobile = window.innerWidth < 768;
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

