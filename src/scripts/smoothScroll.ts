import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  lenis = new Lenis({
    duration: isMobile ? 0.4 : 0.8,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !isMobile,
    wheelMultiplier: isMobile ? 1.2 : 1.0,
    touchMultiplier: isTouchDevice ? 1.0 : 1.8,
    infinite: false,
    lerp: isMobile ? 0.15 : 0.08,
    syncTouch: !isTouchDevice,
    autoResize: true,
    overscroll: true,
  });

  function raf(time: number) {
    try {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    } catch (error) {
      console.warn('Scroll RAF failed:', error);
      destroySmoothScroll();
    }
  }

  rafId = requestAnimationFrame(raf);

  window.lenis = lenis;

  window.dispatchEvent(new Event('lenis:init'));

  lenis?.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    // Scroll event handling
  });
  
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target && lenis && target instanceof HTMLElement) {
        e.preventDefault();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        lenis.scrollTo(target, {
          offset: 0,
          duration: isTouchDevice ? 0.3 : 0.6,
          easing: (t: number) => 1 - Math.pow(1 - t, 3)
        });
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
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  lenis.scrollTo(target, {
    offset: options?.offset ?? 0,
    duration: options?.duration ?? (isTouchDevice ? 0.3 : 0.8),
    easing: options?.duration ? undefined : (t: number) => 1 - Math.pow(1 - t, 3)
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

export function updateScrollSettings() {
  if (!lenis) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

  if (isTouchDevice || isLowEndDevice) {
    lenis.options.duration = 0.2;
    lenis.options.lerp = 0.2;
  }
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null && !lenis.isStopped;
}
