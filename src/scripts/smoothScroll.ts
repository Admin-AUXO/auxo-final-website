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

  // For mobile, use very minimal Lenis intervention to allow native momentum scrolling
  // Similar to Google's approach - let the browser handle most of the scrolling
  if (isMobile) {
    lenis = new Lenis({
      duration: 0.1, // Very short duration for minimal intervention
      easing: (t: number) => t, // Linear easing for natural feel
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: false, // Disable wheel smoothing on mobile
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0, // Let native touch handle momentum
      infinite: false,
      lerp: 0.1, // Low lerp for responsive but not over-smoothed
      syncTouch: false, // Don't sync touch to avoid interfering with native momentum
      autoResize: true,
      overscroll: false,
      normalizeWheel: false,
      smoothTouch: false, // Let browser handle touch scrolling
    });
  } else {
    // Desktop settings remain optimized
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
      normalizeWheel: true,
      smoothTouch: !isLowEndDevice,
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
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // On mobile, prefer native scroll behavior for smoother experience
  if (isMobile || !lenis) {
    // Fallback to native scroll for mobile or if Lenis is not available
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

  // Desktop behavior with Lenis
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

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

  // On mobile, keep minimal intervention settings regardless of other conditions
  if (isMobile) {
    lenis.options.duration = 0.1;
    lenis.options.lerp = 0.1;
    lenis.options.smoothWheel = false;
    lenis.options.smoothTouch = false;
    lenis.options.syncTouch = false;
    return;
  }

  // Desktop adaptive settings
  if (isTouchDevice || isLowEndDevice || isSlowConnection) {
    lenis.options.duration = 0.3;
    lenis.options.lerp = 0.15;
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
