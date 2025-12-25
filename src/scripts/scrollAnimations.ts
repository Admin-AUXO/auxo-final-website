import { init, refresh, refreshWithDelay, cleanup } from './utils/scrollReveal';

const REFRESH_DELAY = 150;

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  init({
    duration: isMobile ? 300 : 500,
    easing: 'ease-out-cubic',
    once: true,
    offset: isMobile ? 40 : 80,
    delay: 0,
    disable: prefersReducedMotion,
  });

}

export function refreshScrollAnimations(): void {
  refresh();
}

export function refreshScrollAnimationsWithDelay(delay: number = REFRESH_DELAY): void {
  refreshWithDelay(delay);
}

export function cleanupScrollAnimations(): void {
  cleanup();
}
