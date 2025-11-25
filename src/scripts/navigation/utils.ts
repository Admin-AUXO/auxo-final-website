export function getNavElements() {
  return {
    nav: document.getElementById('main-navigation'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileMenuButton: document.getElementById('mobile-menu-button'),
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
}

export function findDropdownContent(buttonEl: HTMLElement): HTMLElement | null {
  let content = buttonEl.nextElementSibling as HTMLElement;

  if (!content || !content.classList.contains('mobile-dropdown-content')) {
    const parent = buttonEl.parentElement;
    content = parent?.querySelector('.mobile-dropdown-content') as HTMLElement || null;
  }

  return content?.classList.contains('mobile-dropdown-content') ? content : null;
}

