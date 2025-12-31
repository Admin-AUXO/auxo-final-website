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

export function lockScroll(): void {
  scrollLockCount++;

  if (scrollLockCount === 1) {
    // 1. Priority: Stop Lenis (This is usually enough for smooth scroll setups)
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.stop();
    }

    // 2. Secondary: Native Lock (Prevent touch drag on background)
    // We do NOT use position: fixed here to avoid layout jumps.
    // We simply hide overflow and disable touch actions on the body.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    // ONLY set overflow: hidden. Do NOT set position: fixed.
    document.body.style.overflow = 'hidden';
  }
}

export function unlockScroll(): void {
  if (scrollLockCount > 0) scrollLockCount--;

  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.removeProperty('--scrollbar-width');

    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    // Restart Lenis
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.start();
    }
  }
}

function preventScroll(e: Event): void {
  e.preventDefault();
}

export function forceUnlockScroll(): void {
  scrollLockCount = 0;
  unlockScroll();
}

