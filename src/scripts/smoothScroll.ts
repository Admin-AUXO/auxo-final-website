import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  lenis = new Lenis({
    duration: isMobile ? 1.0 : 0.9,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: isMobile ? 1.1 : 1.05,
    touchMultiplier: isMobile ? 2.0 : 1.8,
    infinite: false,
    lerp: isMobile ? 0.12 : 0.1,
    syncTouch: true,
    syncTouchLerp: isMobile ? 0.1 : 0.08,
    touchInertiaMultiplier: 35,
    touchInertiaDeltaMultiplier: 0.5,
  } as any);

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
  
  window.lenis = lenis;
  
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target && lenis && target instanceof HTMLElement) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      }
    });
  });

  let lastPath = window.location.pathname;
  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (lenis && currentPath !== lastPath) {
      lenis.scrollTo(0, { immediate: true });
      setTimeout(() => lenis?.scrollTo(0, { immediate: true }), 100);
      lastPath = currentPath;
    }
  });
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
    offset: options?.offset ?? 0,
    duration: options?.duration ?? 1.0,
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
