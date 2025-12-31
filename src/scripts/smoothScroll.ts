// Native smooth scrolling implementation
export function initSmoothScroll() {
  // Handle anchor links with native smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        e.preventDefault();
        scrollToElement(target, { offset: 0 });
      }
    });
  });

  // Handle hash on page load (Astro view transitions)
  document.addEventListener('astro:page-load', () => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      setTimeout(() => {
        const target = document.querySelector(hash) as HTMLElement;
        if (target) {
          scrollToElement(target, { offset: 0 });
        }
      }, 100);
    }
  });
}

export function stopSmoothScroll() {
  // No-op - native smooth scrolling doesn't need to be stopped
}

export function startSmoothScroll() {
  // No-op - native smooth scrolling doesn't need to be started
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) {
  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (element) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (options?.immediate) {
      element.scrollIntoView({
        behavior: 'instant',
        block: 'start'
      });
    } else if (isMobile && 'scrollBehavior' in document.documentElement.style) {
      // Use native smooth scrolling on mobile if supported
    element.scrollIntoView({
        behavior: 'smooth',
      block: 'start'
    });
    } else {
      // Fallback for older browsers or when smooth scrolling is disabled
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - (options?.offset || 0);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}

export function destroySmoothScroll() {
  // No-op - native smooth scrolling doesn't need cleanup
}

export function getLenis(): null {
  return null; // Lenis is removed
}

export function isSmoothScrollEnabled(): boolean {
  return true; // Native smooth scrolling is always enabled
}
