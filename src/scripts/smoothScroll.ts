/**
 * Lenis Smooth Scroll Implementation
 * Provides buttery-smooth, physics-based scrolling for premium feel
 */

import Lenis from 'lenis';

let lenis: Lenis | null = null;

/**
 * Initialize smooth scrolling
 * Call this once on page load
 */
export function initSmoothScroll() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('Smooth scroll disabled: user prefers reduced motion');
    return;
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Animation frame loop
  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).lenis = lenis;
  }

  console.log('✓ Smooth scroll initialized');
}

/**
 * Stop smooth scrolling
 */
export function stopSmoothScroll() {
  lenis?.stop();
}

/**
 * Start smooth scrolling
 */
export function startSmoothScroll() {
  lenis?.start();
}

/**
 * Scroll to a specific element
 */
export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number }) {
  if (!lenis) return;

  lenis.scrollTo(target, {
    offset: options?.offset || 0,
    duration: options?.duration || 1.2,
  });
}

/**
 * Destroy Lenis instance
 */
export function destroySmoothScroll() {
  lenis?.destroy();
  lenis = null;
}
