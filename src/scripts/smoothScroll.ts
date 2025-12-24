import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

  if (isAndroid) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overscrollBehavior = 'contain';
    html.style.webkitOverflowScrolling = 'touch';
    html.style.touchAction = 'pan-y';
    html.style.scrollBehavior = 'auto';

    body.style.overscrollBehavior = 'contain';
    body.style.webkitOverflowScrolling = 'touch';
    body.style.touchAction = 'pan-y';

    const touchStartHandler = () => {};
    document.addEventListener('touchstart', touchStartHandler, { passive: true, capture: true });
    document.addEventListener('touchmove', touchStartHandler, { passive: true, capture: true });
    document.addEventListener('touchend', touchStartHandler, { passive: true, capture: true });

    return;
  }

  if (isMobile) {
    lenis = new Lenis({
      duration: 0.02,
      easing: (t: number) => t,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      lerp: 0.02,
      syncTouch: false,
      autoResize: true,
      overscroll: false,
      normalizeWheel: false,
      touchInertiaMultiplier: 1.0,
      wheelInertiaMultiplier: 1.0,
    });
  } else {
    lenis = new Lenis({
      duration: isLowEndDevice ? 0.3 : 0.5,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isLowEndDevice,
      wheelMultiplier: isTouchDevice ? 1.0 : 0.8,
      touchMultiplier: isTouchDevice ? 1.2 : 1.5,
      infinite: false,
      lerp: isLowEndDevice ? 0.12 : 0.1,
      syncTouch: true,
      autoResize: true,
      overscroll: false,
      normalizeWheel: true,
    });
  }

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

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
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

  const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;

  if (isMobileDevice && !isAndroid) {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, select, [contenteditable]')) {
        return true;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    document.addEventListener('touchend', () => {}, { passive: true });
  }

  document.addEventListener('astro:page-load', () => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      setTimeout(() => {
        const target = document.querySelector(hash) as HTMLElement;
        if (target) {
          lenis?.scrollTo(target, { offset: -20, immediate: true });
        }
      }, 100);
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }
  });
}

export function stopSmoothScroll() {
  lenis?.stop();
}

export function startSmoothScroll() {
  lenis?.start();
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) {
  if (!lenis) {
    const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
    if (element) {
      element.scrollIntoView({
        behavior: options?.immediate ? 'instant' : 'smooth',
        block: 'start'
      });
    }
    return;
  }

  try {
    lenis.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.immediate ? 0 : (options?.duration ?? 0.8),
      immediate: options?.immediate
    });
  } catch (error) {
    console.warn('Lenis scrollTo failed:', error);
    const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
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

  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

  if (isLowEndDevice || isSlowConnection) {
    lenis.options.duration = 0.4;
    lenis.options.lerp = 0.1;
  }
}


export function isSmoothScrollEnabled(): boolean {
  return lenis !== null && !lenis.isStopped;
}
