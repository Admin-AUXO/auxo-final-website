import { trackNavigation, trackCTAClick } from './ga4';

export function initNavigationTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleNavClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a, button');
    if (!target) return;

    const linkText = target.textContent?.trim() || '';
    const href = target.getAttribute('href') || '';

    const isInNav = target.closest('nav, [role="navigation"]');
    const isInFooter = target.closest('footer');
    const isInMobileMenu = target.closest('[id*="mobile-menu"]');
    const isInDropdown = target.closest('[role="menu"], [data-dropdown]');

    let location: 'header' | 'footer' | 'mobile_menu' | 'dropdown' = 'header';
    if (isInFooter) location = 'footer';
    else if (isInMobileMenu) location = 'mobile_menu';
    else if (isInDropdown) location = 'dropdown';

    if (isInNav || isInFooter) {
      const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);

      trackNavigation({
        linkText,
        linkUrl: href,
        linkLocation: location,
        isExternal,
      });
    }
  };

  document.addEventListener('click', handleNavClick, true);

  return () => {
    document.removeEventListener('click', handleNavClick, true);
  };
}

export function initCTATracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCTAClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-cta], .btn-primary, .cta-button');
    if (!target) return;

    const ctaText = target.textContent?.trim() || '';
    const ctaDestination = target.getAttribute('href') || target.getAttribute('data-destination') || '';
    const ctaLocation =
      target.getAttribute('data-section') ||
      target.closest('[data-section]')?.getAttribute('data-section') ||
      target.closest('section')?.id ||
      'unknown';
    const ctaType = target.tagName.toLowerCase() === 'a' ? 'link' : 'button';

    if (ctaText || ctaDestination) {
      trackCTAClick({
        ctaText,
        ctaLocation,
        ctaDestination,
        ctaType,
      });
    }
  };

  document.addEventListener('click', handleCTAClick, true);

  return () => {
    document.removeEventListener('click', handleCTAClick, true);
  };
}

export function initThemeTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleThemeChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    const theme = customEvent.detail?.theme;

    if (!theme) return;

    import('./ga4').then(({ trackThemeChange }) => {
      trackThemeChange(theme);
    });
  };

  document.addEventListener('themechange', handleThemeChange);

  return () => {
    document.removeEventListener('themechange', handleThemeChange);
  };
}

export function initInteractionTracking(): () => void {
  const cleanupFunctions: Array<() => void> = [];

  cleanupFunctions.push(initNavigationTracking());
  cleanupFunctions.push(initCTATracking());
  cleanupFunctions.push(initThemeTracking());

  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}
