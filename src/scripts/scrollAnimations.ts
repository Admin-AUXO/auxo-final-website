import AOS from 'aos';

const REFRESH_DELAY = 150;
const SCROLL_OFFSET = 80;

let lenisScrollHandler: (() => void) | null = null;
let rafId: number | null = null;

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  AOS.init({
    duration: isMobile ? 300 : 500, // Faster animations on mobile
    easing: 'ease-out-cubic',
    once: true,
    offset: isMobile ? 40 : SCROLL_OFFSET, // Smaller offset on mobile
    delay: 0,
    disable: prefersReducedMotion,
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: isMobile ? 200 : 99, // Less frequent updates on mobile
    mirror: false,
    anchorPlacement: 'top-bottom',
  });

  const setupLenisIntegration = () => {
    if (window.lenis && !lenisScrollHandler) {
      // Only refresh AOS on scroll for desktop, not mobile
      if (!isMobile) {
        lenisScrollHandler = () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            AOS.refresh();
          });
        };
        window.lenis.on('scroll', lenisScrollHandler);
      }

      const delay = isMobile ? 200 : 100; // Shorter delay on mobile
      setTimeout(() => {
        AOS.refresh();
      }, delay);
    }
  };

  if (window.lenis) {
    setupLenisIntegration();
  } else {
    document.addEventListener('lenis:init', setupLenisIntegration, { once: true });
  }

  let lastPath = window.location.pathname;
  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      refreshScrollAnimationsWithDelay(isMobile ? 100 : 200);
      lastPath = currentPath;
    }
  });
}

export function refreshScrollAnimations(): void {
  if (typeof AOS !== 'undefined' && AOS.refresh) {
    AOS.refresh();
  }
}

export function refreshScrollAnimationsWithDelay(delay: number = REFRESH_DELAY): void {
  setTimeout(() => {
    if (typeof AOS !== 'undefined' && AOS.refresh) {
      AOS.refresh();
    }
  }, delay);
}

export function cleanupScrollAnimations(): void {
  if (lenisScrollHandler && window.lenis) {
    window.lenis.off('scroll', lenisScrollHandler);
    lenisScrollHandler = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
