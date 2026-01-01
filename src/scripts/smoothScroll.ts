import Lenis from 'lenis';
import { isMobileDevice } from './utils/deviceDetection';
import { getScrollTop } from './utils/scrollHelpers';
import { SCROLL_OFFSETS } from './constants';
import { forceUnlockScroll } from './navigation/utils';

let lenis: Lenis | null = null;
let isMobile = false;
let rafId: number | null = null;
let anchorClickHandlers: Array<{ anchor: Element; handler: (e: Event) => void }> = [];
let pageLoadHandler: (() => void) | null = null;

let lastScrollY = 0;
let idleFrameCount = 0;
const IDLE_THRESHOLD = 60;
let isRafPaused = false;
let resumeRafHandler: (() => void) | null = null;

function handleAnchorClick(e: Event, target: HTMLElement, offset: number = SCROLL_OFFSETS.DEFAULT): void {
  e.preventDefault();

  if (document.body.classList.contains('scroll-locked')) {
    forceUnlockScroll();
  }

  requestAnimationFrame(() => {
    const rect = target.getBoundingClientRect();
    const scrollTop = getScrollTop();
    const targetPosition = rect.top + scrollTop - offset;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  });
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
      if (document.body.classList.contains('scroll-locked')) {
        forceUnlockScroll();
      }

      if (lenis) {
        requestAnimationFrame(() => {
          lenis?.scrollTo(target, { immediate: true, offset: -SCROLL_OFFSETS.DEFAULT });
        });
      } else {
        requestAnimationFrame(() => {
          const offset = SCROLL_OFFSETS.DEFAULT;
          const rect = target.getBoundingClientRect();
          const scrollTop = getScrollTop();
          const targetPosition = rect.top + scrollTop - offset;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        });
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
    if (!lenis) return;

    lenis.raf(time);

    const currentScrollY = lenis.scroll;
    const delta = Math.abs(currentScrollY - lastScrollY);

    if (delta < 0.01) {
      idleFrameCount++;
      if (idleFrameCount > IDLE_THRESHOLD && !isRafPaused) {
        isRafPaused = true;
        return;
      }
    } else {
      idleFrameCount = 0;
      isRafPaused = false;
    }

    lastScrollY = currentScrollY;
    rafId = requestAnimationFrame(raf);
  }

  resumeRafHandler = () => {
    if (isRafPaused && lenis) {
      isRafPaused = false;
      idleFrameCount = 0;
      rafId = requestAnimationFrame(raf);
    }
  };

  rafId = requestAnimationFrame(raf);

  window.addEventListener('wheel', resumeRafHandler, { passive: true });
  window.addEventListener('touchstart', resumeRafHandler, { passive: true });

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

  if (resumeRafHandler) {
    window.removeEventListener('wheel', resumeRafHandler);
    window.removeEventListener('touchstart', resumeRafHandler);
    resumeRafHandler = null;
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

  lastScrollY = 0;
  idleFrameCount = 0;
  isRafPaused = false;
}

export function isSmoothScrollEnabled(): boolean {
  return lenis !== null;
}

export function getLenisInstance(): Lenis | null {
  return lenis;
}
