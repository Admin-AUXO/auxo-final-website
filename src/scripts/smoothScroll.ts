import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
    infinite: false,
    lerp: 0.1,
    syncTouch: true,
    syncTouchLerp: 0.075,
  });

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
  
  if (typeof window !== 'undefined') {
    (window as any).lenis = lenis;
    
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        if (target && lenis && target instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -80,
            duration: 1.5,
          });
        }
      });
    });

    document.addEventListener('astro:page-load', () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        setTimeout(() => lenis?.scrollTo(0, { immediate: true }), 100);
      }
    });
  }
}

export function stopSmoothScroll() {
  lenis?.stop();
}

export function startSmoothScroll() {
  lenis?.start();
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number }) {
  if (!lenis) return;
  lenis.scrollTo(target, {
    offset: options?.offset || 0,
    duration: options?.duration || 1.2,
  });
}

export function destroySmoothScroll() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lenis?.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}
