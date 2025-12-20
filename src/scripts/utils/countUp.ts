import { CountUp } from 'countup.js';
import { observeOnce } from './observers.js';

export function initCountUpAnimations() {
  const counters = document.querySelectorAll('[data-countup]');
  if (counters.length === 0) return;

  counters.forEach((counter) => {
    observeOnce(
      counter,
      () => {
        const target = counter as HTMLElement;
        const endValue = parseInt(target.getAttribute('data-countup') || '0', 10);
        const duration = parseFloat(target.getAttribute('data-countup-duration') || '2');
        const decimals = parseInt(target.getAttribute('data-countup-decimals') || '0', 10);
        const prefix = target.getAttribute('data-countup-prefix') || '';
        const suffix = target.getAttribute('data-countup-suffix') || '';

        const countUp = new CountUp(target, endValue, {
          duration,
          decimalPlaces: decimals,
          prefix,
          suffix,
          separator: ',',
          enableScrollSpy: false,
          scrollSpyDelay: 0,
        });

        if (!countUp.error) {
          countUp.start();
        } else if (import.meta.env.DEV) {
          console.error('CountUp error:', countUp.error);
        }
      },
      { threshold: 0.3, rootMargin: '0px' }
    );
  });
}

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
  return new CountUp(target, endValue, {
    startVal: options?.startValue || 0,
    duration: options?.duration || 2,
    decimalPlaces: options?.decimals || 0,
    prefix: options?.prefix || '',
    suffix: options?.suffix || '',
    separator: ',',
  });
}
