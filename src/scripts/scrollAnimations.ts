/**
 * AOS (Animate On Scroll) Setup
 * Beautiful scroll-triggered animations for sections entering viewport
 */

import AOS from 'aos';

/**
 * Initialize AOS animations
 * Call this once on page load
 */
export function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  AOS.init({
    // Global settings
    duration: 800,
    easing: 'ease-out-cubic',
    once: true, // Animation happens only once
    offset: 50, // Offset (in px) from the original trigger point
    delay: 0, // Values from 0 to 3000, with step 50ms

    // Disable animations if user prefers reduced motion
    disable: prefersReducedMotion ? true : false,

    // Settings that can be overridden on per-element basis
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,

    // Mobile settings
    mirror: false, // Whether elements should animate out while scrolling past them
    anchorPlacement: 'top-bottom', // Defines which position of the element regarding to window should trigger the animation
  });

  console.log('✓ Scroll animations initialized');
}

/**
 * Refresh AOS - useful when dynamically adding content
 */
export function refreshScrollAnimations() {
  AOS.refresh();
}

/**
 * Refresh AOS after a delay
 */
export function refreshScrollAnimationsWithDelay(delay: number = 100) {
  setTimeout(() => {
    AOS.refresh();
  }, delay);
}
