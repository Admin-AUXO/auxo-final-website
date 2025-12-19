import AOS from 'aos';

const DEFAULT_REFRESH_DELAY = 100;

export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  AOS.init({
    duration: 400,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
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

  // Refresh AOS on Astro page transitions
  if (typeof document !== 'undefined') {
    document.addEventListener('astro:page-load', () => {
      refreshScrollAnimationsWithDelay();
    });
  }
}

export function refreshScrollAnimations() {
  AOS.refresh();
}

export function refreshScrollAnimationsWithDelay(delay: number = DEFAULT_REFRESH_DELAY) {
  setTimeout(() => AOS.refresh(), delay);
}
