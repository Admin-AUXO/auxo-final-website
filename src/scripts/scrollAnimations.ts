import AOS from 'aos';

const REFRESH_DELAY = 100;
const SCROLL_OFFSET = 80;

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  AOS.init({
    duration: 500,
    easing: 'ease-out-cubic',
    once: true,
    offset: SCROLL_OFFSET,
    delay: 0,
    disable: prefersReducedMotion,
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
    mirror: false,
    anchorPlacement: 'top-bottom',
  });

  if (window.lenis) {
    window.lenis.on('scroll', () => {
      AOS.refresh();
    });
  }

  let lastPath = window.location.pathname;
  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      refreshScrollAnimationsWithDelay();
      lastPath = currentPath;
    }
  });
}

export function refreshScrollAnimations(): void {
  AOS.refresh();
}

export function refreshScrollAnimationsWithDelay(delay: number = REFRESH_DELAY): void {
  setTimeout(() => AOS.refresh(), delay);
}
