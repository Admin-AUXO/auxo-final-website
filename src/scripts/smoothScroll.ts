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

  // Adjust settings based on device capabilities
  const duration = isMobile || isLowEndDevice ? 0.4 : isSafari ? 0.6 : 0.8;
  const lerp = isMobile ? 0.15 : isLowEndDevice ? 0.1 : 0.08;
  const wheelMultiplier = isMobile ? 1.2 : isTouchDevice ? 1.1 : 1.0;
  const touchMultiplier = isTouchDevice ? 1.8 : isSafari ? 1.4 : 2.0;

  lenis = new Lenis({
    duration,
    easing: (t: number) => {
      // Use a more performant easing function
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
    normalizeWheel: true,
    // Disable smooth scrolling on very low-end devices
    smoothTouch: !isLowEndDevice,
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

  // Update settings based on device capabilities
  updateScrollSettings();

  // Listen for connection changes and update settings accordingly
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', updateScrollSettings);
  }

  // Update settings on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(updateScrollSettings, 100);
  });

  // Update settings on resize
  window.addEventListener('resize', () => {
    setTimeout(updateScrollSettings, 100);
  });

  lenis?.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {});
  
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target && target instanceof HTMLElement) {
        e.preventDefault();
        scrollToElement(target);
      }
    });
  });

  let lastPath = window.location.pathname;
  let scrollRestorationEnabled = true;

  // Enhanced page load scroll handling
  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (lenis && currentPath !== lastPath) {
      // Check if there's a hash in the URL for anchor navigation
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        // Let the anchor scroll handle this
        scrollRestorationEnabled = false;
        setTimeout(() => {
          scrollRestorationEnabled = true;
        }, 1000);
      } else if (scrollRestorationEnabled) {
        // Scroll to top for new pages
        requestAnimationFrame(() => {
          lenis.scrollTo(0, { immediate: true });
        });
      }
      lastPath = currentPath;
    }
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    if (lenis && scrollRestorationEnabled) {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        const target = document.querySelector(hash);
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
  if (!lenis) {
    // Fallback to native scroll if Lenis is not available
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

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const defaultOffset = isMobile ? -20 : 0;
  const defaultDuration = isTouchDevice ? 0.4 : 0.8;

  try {
    lenis.scrollTo(target, {
      offset: options?.offset ?? defaultOffset,
      duration: options?.immediate ? 0 : (options?.duration ?? defaultDuration),
      easing: options?.immediate ? undefined : (options?.duration ? undefined : (t: number) => 1 - Math.pow(1 - t, 3)),
      immediate: options?.immediate
    });
  } catch (error) {
    console.warn('Lenis scrollTo failed, falling back to native scroll:', error);
    // Fallback to native scroll
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

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

  if (isTouchDevice || isLowEndDevice || isSlowConnection) {
    lenis.options.duration = 0.2;
    lenis.options.lerp = 0.2;
    lenis.options.smoothWheel = false;
    lenis.options.smoothTouch = false;
  } else {
    // Restore optimal settings for fast devices/connections
    lenis.options.duration = 0.8;
    lenis.options.lerp = 0.08;
    lenis.options.smoothWheel = true;
    lenis.options.smoothTouch = true;
  }
}

// Performance monitoring
export function getScrollPerformance(): { fps: number; isSmooth: boolean } {
  if (!lenis) return { fps: 0, isSmooth: false };

  // Simple performance check based on scroll velocity
  const velocity = Math.abs(lenis.velocity || 0);
  const fps = Math.min(60, Math.max(0, 60 - velocity * 10));

  return {
    fps: Math.round(fps),
    isSmooth: velocity < 5 // Consider smooth if velocity is low
  };
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null && !lenis.isStopped;
}
