import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

  // For mobile, make scrolling instant/fast
  if (isMobile) {
    lenis = new Lenis({
      duration: 0.05, // Ultra fast for instant feel
      easing: (t: number) => t, // Linear easing for instant response
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: false, // Disable smooth wheel on mobile
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
      lerp: 0.02, // Ultra responsive lerp for instant feel
      syncTouch: false, // Don't sync touch to avoid conflicts
      autoResize: true,
      overscroll: false,
    });
  } else {
    // Desktop keeps smooth scrolling
    lenis = new Lenis({
      duration: isLowEndDevice ? 0.4 : 0.8,
      easing: (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isLowEndDevice,
      wheelMultiplier: isTouchDevice ? 1.1 : 1.0,
      touchMultiplier: isTouchDevice ? 1.5 : 2.0,
      infinite: false,
      lerp: isLowEndDevice ? 0.1 : 0.08,
      syncTouch: true,
      autoResize: true,
      overscroll: false,
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

  // Universal scroll support for mobile
  const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
  if (isMobileDevice) {
    // Ensure touch events reach the scrollable container
    const handleTouchStart = (e: TouchEvent) => {
      // Only prevent default if we're not in an input/textarea
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, select, [contenteditable]')) {
        // Allow normal scrolling
        return true;
      }
    };

    // Add universal touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    document.addEventListener('touchend', () => {}, { passive: true });
  }

  document.addEventListener('astro:page-load', () => {
    lenis?.scrollTo(0, { immediate: true });
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
