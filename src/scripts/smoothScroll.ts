import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    autoResize: true,
    normalizeWheel: true,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose lenis globally for scroll lock integration
  if (typeof window !== 'undefined') {
    (window as any).__lenis = lenis;
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        e.preventDefault();
        scrollToElement(target);
      }
    });
  });

  document.addEventListener('astro:page-load', () => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const target = document.querySelector(hash) as HTMLElement;
          if (target) {
            scrollToElement(target);
          }
        }, 100);
      });
    }
  });
}

export function stopSmoothScroll() {
  if (lenis) {
    lenis.stop();
  }
}

export function startSmoothScroll() {
  if (lenis) {
    lenis.start();
  }
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; immediate?: boolean }) {
  if (!lenis) return;

  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (!element) return;

  const offset = options?.offset || 0;

  if (options?.immediate) {
    lenis.scrollTo(element, { offset, immediate: true });
  } else {
    lenis.scrollTo(element, { offset });
  }
}

export function destroySmoothScroll() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
    if (typeof window !== 'undefined') {
      delete (window as any).__lenis;
    }
  }
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null;
}

export function getLenisInstance(): Lenis | null {
  return lenis;
}
