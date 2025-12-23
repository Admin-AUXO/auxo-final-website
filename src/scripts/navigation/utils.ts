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
let savedScrollY: number | null = null;

export function lockScroll(): void {
  scrollLockCount++;

  // Only apply scroll lock on first lock
  if (scrollLockCount === 1) {
    // Stop Lenis temporarily to prevent conflicts
    if (window.lenis) {
      window.lenis.stop();
    }

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    savedScrollY = scrollY;

    document.body.setAttribute('data-scroll-y', scrollY.toString());
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    // Use more reliable scroll locking method
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent touch scrolling on mobile
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
  }
}

export function unlockScroll(): void {
  if (scrollLockCount > 0) {
    scrollLockCount--;
  }

  // Only remove scroll lock when all locks are released
  if (scrollLockCount === 0 && savedScrollY !== null) {
    // Remove scroll prevention listeners
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);

    // Restore body styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore scroll position using Lenis if available, otherwise use native scroll
    if (window.lenis) {
      window.lenis.start();
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        window.lenis?.scrollTo(savedScrollY!, { immediate: true });
      });
    } else {
      // Fallback to native scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollY!, behavior: 'instant' });
      });
    }

    // Clean up attributes and classes
    document.body.removeAttribute('data-scroll-y');
    document.documentElement.style.removeProperty('--scroll-y');
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    savedScrollY = null;
  }
}

// Prevent scroll function for event listeners
function preventScroll(e: Event): void {
  e.preventDefault();
}

export function forceUnlockScroll(): void {
  scrollLockCount = 0;
  if (savedScrollY !== null) {
    unlockScroll();
  }
}

