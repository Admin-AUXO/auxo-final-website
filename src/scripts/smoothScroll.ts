import Lenis from 'lenis';
import { isMobileDevice } from './utils/deviceDetection';

let lenis: Lenis | null = null;
let isMobile = false;
let rafId: number | null = null;
let anchorClickHandlers: Array<{ anchor: Element; handler: (e: Event) => void }> = [];
let pageLoadHandler: (() => void) | null = null;

function handleAnchorClick(e: Event, target: HTMLElement, offset: number = 80): void {
  e.preventDefault();
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

function setupAnchorLinks(): void {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchorClickHandlers = [];

  anchors.forEach((anchor) => {
    const handler = (e: Event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        if (isMobile || !lenis) {
          handleAnchorClick(e, target);
        } else {
          e.preventDefault();
          scrollToElement(target);
        }
      }
    };
    anchor.addEventListener('click', handler);
    anchorClickHandlers.push({ anchor, handler });
  });
}

function handleHashNavigation(): void {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash) as HTMLElement;
    if (target) {
      if (lenis) {
        requestAnimationFrame(() => {
          lenis?.scrollTo(target, { immediate: true, offset: -80 });
        });
      } else {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
  }
}

export function initSmoothScroll() {
  if (lenis && !isMobile) return;

  isMobile = isMobileDevice();
  
  if (isMobile) {
    if (lenis) {
      destroySmoothScroll();
    }
    if (typeof window !== 'undefined') {
      (window as any).__lenis = null;
    }

    setupAnchorLinks();

    if (pageLoadHandler) {
      document.removeEventListener('astro:page-load', pageLoadHandler);
    }
    pageLoadHandler = handleHashNavigation;
    document.addEventListener('astro:page-load', pageLoadHandler);
    
    return;
  }

  if (lenis) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);

  if (typeof window !== 'undefined') {
    (window as any).__lenis = lenis;
  }

  setupAnchorLinks();

  if (pageLoadHandler) {
    document.removeEventListener('astro:page-load', pageLoadHandler);
  }
  pageLoadHandler = handleHashNavigation;
  document.addEventListener('astro:page-load', pageLoadHandler);
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
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (lenis) {
    lenis.destroy();
    lenis = null;
    if (typeof window !== 'undefined') {
      delete (window as any).__lenis;
    }
  }

  anchorClickHandlers.forEach(({ anchor, handler }) => {
    anchor.removeEventListener('click', handler);
  });
  anchorClickHandlers = [];

  if (pageLoadHandler) {
    document.removeEventListener('astro:page-load', pageLoadHandler);
    pageLoadHandler = null;
  }
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null;
}

export function getLenisInstance(): Lenis | null {
  return lenis;
}
