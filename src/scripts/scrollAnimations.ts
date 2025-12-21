import AOS from 'aos';

const REFRESH_DELAY = 150;
const SCROLL_OFFSET = 80;

let lenisScrollHandler: (() => void) | null = null;
let rafId: number | null = null;

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  AOS.init({
    duration: isMobile ? 400 : 500,
    easing: 'ease-out-cubic',
    once: true,
    offset: isMobile ? 60 : SCROLL_OFFSET,
    delay: 0,
    disable: prefersReducedMotion,
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: isMobile ? 150 : 99,
    mirror: false,
    anchorPlacement: 'top-bottom',
  });

  const setupLenisIntegration = () => {
    if (window.lenis && !lenisScrollHandler) {
      lenisScrollHandler = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          AOS.refresh();
        });
      };

      window.lenis.on('scroll', lenisScrollHandler);

      const delay = isMobile ? 300 : 100;
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
      refreshScrollAnimationsWithDelay(200);
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
