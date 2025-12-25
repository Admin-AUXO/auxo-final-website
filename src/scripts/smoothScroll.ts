import Lenis from 'lenis';

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isMacOS = /Mac/.test(navigator.platform);
  const isWindows = /Win/.test(navigator.platform);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasWheelSupport = 'onwheel' in document || 'onmousewheel' in document;

  const html = document.documentElement;
  const body = document.body;
  
  html.style.overflowY = 'auto';
  html.style.overflowX = 'hidden';
  body.style.overflowY = 'auto';
  body.style.overflowX = 'hidden';
  html.style.overscrollBehavior = 'contain';
  html.style.touchAction = 'pan-y';
  body.style.overscrollBehavior = 'contain';
  body.style.touchAction = 'pan-y';

  if (isMobile) {
    (html.style as any).webkitOverflowScrolling = 'touch';
    (body.style as any).webkitOverflowScrolling = 'touch';
    html.style.height = '100%';
    body.style.minHeight = '100%';
  }

  if (isMobile) {
    lenis = new Lenis({
      duration: isAndroid ? 1.2 : 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: hasWheelSupport,
      wheelMultiplier: hasWheelSupport ? 1.2 : 1.0,
      touchMultiplier: isAndroid ? 2.0 : 1.8,
      infinite: false,
      lerp: isAndroid ? 0.08 : 0.06,
      syncTouch: false,
      autoResize: true,
      overscroll: false,
      touchInertiaMultiplier: isAndroid ? 1.2 : 1.0,
      wheelInertiaMultiplier: 1.0,
    } as any);
  } else {
    lenis = new Lenis({
      duration: 0.05,
      easing: (t: number) => Math.min(1, t * 1.2),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: isTouchDevice ? 1.0 : (isMacOS ? 1.5 : 2.0),
      touchMultiplier: isTouchDevice ? 1.5 : (isMacOS ? 2.0 : 2.5),
      infinite: false,
      lerp: 0.05,
      syncTouch: true,
      autoResize: true,
      overscroll: false,
    } as any);
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
  html.classList.add('lenis');
  html.setAttribute('data-lenis-prevent', '');
  window.lenis = lenis;
  window.dispatchEvent(new Event('lenis:init'));

  if (isMobile) {
    requestAnimationFrame(() => {
      html.style.overflowY = 'auto';
      body.style.overflowY = 'auto';
    });
  }

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

  if (isMobile) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isCarouselTouch = false;

    document.addEventListener('touchstart', (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, select, [contenteditable]')) {
        return;
      }

      const carousel = target.closest('.carousel-container, .embla, [class*="carousel"]');
      if (carousel) {
        isCarouselTouch = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isCarouselTouch || !lenis) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = Math.abs(touchX - touchStartX);
      const deltaY = Math.abs(touchY - touchStartY);

      if (deltaX > deltaY && deltaX > 10) {
        lenis.stop();
      } else if (deltaY > deltaX && deltaY > 10) {
        lenis.start();
        isCarouselTouch = false;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (isCarouselTouch && lenis && lenis.isStopped) {
        setTimeout(() => {
          if (lenis) {
            lenis.start();
          }
          isCarouselTouch = false;
        }, 100);
      }
    }, { passive: true });
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
