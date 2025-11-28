/**
 * CountUp.js Utility
 * Animated number counting for statistics and metrics
 */

import { CountUp } from 'countup.js';

/**
 * Initialize counter animations for all elements with data-countup attribute
 */
export function initCountUpAnimations() {
  const counters = document.querySelectorAll('[data-countup]');

  if (counters.length === 0) return;

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const endValue = parseInt(target.getAttribute('data-countup') || '0', 10);
          const duration = parseFloat(target.getAttribute('data-countup-duration') || '2');
          const decimals = parseInt(target.getAttribute('data-countup-decimals') || '0', 10);
          const prefix = target.getAttribute('data-countup-prefix') || '';
          const suffix = target.getAttribute('data-countup-suffix') || '';

          const countUp = new CountUp(target, endValue, {
            duration: duration,
            decimalPlaces: decimals,
            prefix: prefix,
            suffix: suffix,
            separator: ',',
            enableScrollSpy: false,
            scrollSpyDelay: 0,
          });

          if (!countUp.error) {
            countUp.start();
          } else {
            console.error('CountUp error:', countUp.error);
          }

          // Stop observing after animation starts
          observer.unobserve(target);
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px',
    }
  );

  // Observe all counter elements
  counters.forEach((counter) => {
    observer.observe(counter);
  });

  console.log(`✓ CountUp initialized for ${counters.length} elements`);
}

/**
 * Create a manual CountUp instance
 * @param target Element or selector
 * @param endValue Final number
 * @param options CountUp options
 */
export function createCountUp(
  target: string | HTMLElement,
  endValue: number,
  options?: {
    startValue?: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
  }
) {
  const countUp = new CountUp(target, endValue, {
    startVal: options?.startValue || 0,
    duration: options?.duration || 2,
    decimalPlaces: options?.decimals || 0,
    prefix: options?.prefix || '',
    suffix: options?.suffix || '',
    separator: ',',
  });

  return countUp;
}
