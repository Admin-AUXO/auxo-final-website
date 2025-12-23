import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isMobile) {
    lenis = new Lenis({
      duration: 0.1,
      easing: (t: number) => t,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
      lerp: 0.1,
      syncTouch: false,
      autoResize: true,
      overscroll: false,
    });
  } else {
    const duration = isSafari ? 0.6 : 0.8;
    const lerp = isLowEndDevice ? 0.1 : 0.08;
    const wheelMultiplier = isTouchDevice ? 1.1 : 1.0;
    const touchMultiplier = isTouchDevice ? 1.4 : 2.0;

    lenis = new Lenis({
      duration,
      easing: (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isLowEndDevice,
      wheelMultiplier,
      touchMultiplier,
      infinite: false,
      lerp,
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

  updateScrollSettings();

  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', updateScrollSettings);
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(updateScrollSettings, 100);
  });

  window.addEventListener('resize', () => {
    setTimeout(updateScrollSettings, 100);
  });

  lenis?.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {});

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

  let lastPath = window.location.pathname;
  let scrollRestorationEnabled = true;

  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        scrollRestorationEnabled = false;
        setTimeout(() => {
          scrollRestorationEnabled = true;
        }, 1000);
      } else if (scrollRestorationEnabled) {
        requestAnimationFrame(() => {
          lenis?.scrollTo(0, { immediate: true });
        });
      }
      lastPath = currentPath;
    }
  });

  window.addEventListener('popstate', () => {
    if (lenis && scrollRestorationEnabled) {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        const target = document.querySelector(hash) as HTMLElement;
        if (target) {
          setTimeout(() => {
            lenis?.scrollTo(target, { offset: -20 });
          }, 100);
        }
      } else {
        lenis.scrollTo(0, { immediate: true });
      }
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
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile || !lenis) {
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({
          behavior: options?.immediate ? 'instant' : 'smooth',
          block: 'start'
        });
      }
    } else {
      target.scrollIntoView({
        behavior: options?.immediate ? 'instant' : 'smooth',
        block: 'start'
      });
    }
    return;
  }

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const defaultOffset = 0;
  const defaultDuration = isTouchDevice ? 0.6 : 0.8;

  try {
    lenis.scrollTo(target, {
      offset: options?.offset ?? defaultOffset,
      duration: options?.immediate ? 0 : (options?.duration ?? defaultDuration),
      easing: options?.immediate ? undefined : (options?.duration ? undefined : (t: number) => 1 - Math.pow(1 - t, 3)),
      immediate: options?.immediate
    });
  } catch (error) {
    console.warn('Lenis scrollTo failed, falling back to native scroll:', error);
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({
          behavior: options?.immediate ? 'instant' : 'smooth',
          block: 'start'
        });
      }
    } else {
      target.scrollIntoView({
        behavior: options?.immediate ? 'instant' : 'smooth',
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

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

  if (isMobile) {
    lenis.options.duration = 0.1;
    lenis.options.lerp = 0.1;
    lenis.options.smoothWheel = false;
    lenis.options.syncTouch = false;
    return;
  }

  if (isTouchDevice || isLowEndDevice || isSlowConnection) {
    lenis.options.duration = 0.3;
    lenis.options.lerp = 0.15;
    lenis.options.smoothWheel = false;
  } else {
    lenis.options.duration = 0.8;
    lenis.options.lerp = 0.08;
    lenis.options.smoothWheel = true;
  }
}

export function getScrollPerformance(): { fps: number; isSmooth: boolean } {
  if (!lenis) return { fps: 0, isSmooth: false };

  const velocity = Math.abs(lenis.velocity || 0);
  const fps = Math.min(60, Math.max(0, 60 - velocity * 10));

  return {
    fps: Math.round(fps),
    isSmooth: velocity < 5
  };
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null && !lenis.isStopped;
}
