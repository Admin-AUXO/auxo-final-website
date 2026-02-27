import Lenis from 'lenis';
import { isMobileDevice } from './utils/deviceDetection';
import { getScrollTop } from './utils/scrollHelpers';
import { SCROLL_OFFSETS } from './constants';
import { forceUnlockScroll } from './navigation/utils';

const IDLE_THRESHOLD = 60;

let lenis: Lenis | null = null;
let rafId: number | null = null;
let lastScrollY = 0;
let idleFrameCount = 0;
let isRafPaused = false;

const anchorClickHandlers = new Map<Element, (e: Event) => void>();

function handleAnchorClick(e: Event, target: HTMLElement, offset: number = SCROLL_OFFSETS.DEFAULT): void {
  e.preventDefault();

  if (document.body.classList.contains('scroll-locked')) {
    forceUnlockScroll();
  }

  const rect = target.getBoundingClientRect();
  const scrollTop = getScrollTop();
  const targetPosition = rect.top + scrollTop - offset;
  
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

function setupAnchorLinks(): void {
  const anchors = document.querySelectorAll('a[href^="#"]');
  
  anchors.forEach((anchor) => {
    const handler = (e: Event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        if (isMobileDevice() || !lenis) {
          handleAnchorClick(e, target);
        } else {
          e.preventDefault();
          lenis.scrollTo(target);
        }
      }
    };
    anchor.addEventListener('click', handler);
    anchorClickHandlers.set(anchor, handler);
  });
}

function handleHashNavigation(): void {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash) as HTMLElement;
  if (!target) return;

  if (document.body.classList.contains('scroll-locked')) {
    forceUnlockScroll();
  }

  requestAnimationFrame(() => {
    if (lenis) {
      lenis.scrollTo(target, { immediate: true, offset: -SCROLL_OFFSETS.DEFAULT });
    } else {
      const rect = target.getBoundingClientRect();
      const targetPosition = rect.top + getScrollTop() - SCROLL_OFFSETS.DEFAULT;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
}

function resumeRaf(): void {
  if (isRafPaused && lenis) {
    isRafPaused = false;
    idleFrameCount = 0;
    if (rafId === null) {
      rafId = requestAnimationFrame(raf);
    }
  }
}

function raf(time: number): void {
  if (!lenis) return;

  lenis.raf(time);

  const currentScrollY = lenis.scroll;
  const delta = Math.abs(currentScrollY - lastScrollY);

  if (delta < 0.1) {
    idleFrameCount++;
    if (idleFrameCount > IDLE_THRESHOLD) {
      isRafPaused = true;
      rafId = null;
      return;
    }
  } else {
    idleFrameCount = 0;
    isRafPaused = false;
  }

  lastScrollY = currentScrollY;
  rafId = requestAnimationFrame(raf);
}

export function initSmoothScroll(): void {
  if (lenis) return;

  if (isMobileDevice()) {
    setupAnchorLinks();
    document.addEventListener('astro:page-load', handleHashNavigation);
    document.documentElement.style.scrollBehavior = 'smooth';
    return;
  }

  lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.5,
    syncTouch: true,
    touchMultiplier: 2.0,
    infinite: false,
  });

  lastScrollY = window.scrollY;
  rafId = requestAnimationFrame(raf);

  window.addEventListener('wheel', resumeRaf, { passive: true });
  window.addEventListener('touchstart', resumeRaf, { passive: true });

  if (typeof window !== 'undefined') {
    window.__lenis = lenis;
  }

  setupAnchorLinks();
  document.addEventListener('astro:page-load', handleHashNavigation);
}

export function stopSmoothScroll(): void {
  lenis?.stop();
}

export function startSmoothScroll(): void {
  lenis?.start();
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; immediate?: boolean }): void {
  if (!lenis) return;
  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (element) {
    lenis.scrollTo(element, { offset: options?.offset || 0, immediate: options?.immediate });
  }
}

export function destroySmoothScroll(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.removeEventListener('wheel', resumeRaf);
  window.removeEventListener('touchstart', resumeRaf);

  if (lenis) {
    lenis.destroy();
    lenis = null;
    if (typeof window !== 'undefined') {
      delete window.__lenis;
    }
  }

  document.documentElement.style.scrollBehavior = '';

  anchorClickHandlers.forEach((handler, anchor) => {
    anchor.removeEventListener('click', handler);
  });
  anchorClickHandlers.clear();

  document.removeEventListener('astro:page-load', handleHashNavigation);
  
  lastScrollY = 0;
  idleFrameCount = 0;
  isRafPaused = false;
}

export function getLenisInstance(): Lenis | null {
  return lenis;
}
