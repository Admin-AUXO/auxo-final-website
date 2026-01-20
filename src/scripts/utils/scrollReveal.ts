import { isMobileDevice } from './deviceDetection';

export interface ScrollRevealOptions {
  duration?: number;
  easing?: string;
  once?: boolean;
  offset?: number;
  delay?: number;
  disable?: boolean;
  threshold?: number;
}

export interface RevealElement extends HTMLElement {
  _revealObserver?: IntersectionObserver;
  _revealAnimated?: boolean;
}

const DEFAULT_OPTIONS: Required<ScrollRevealOptions> = {
  duration: 200,
  easing: 'ease-out',
  once: true,
  offset: 60,
  delay: 0,
  disable: false,
  threshold: 0.05,
};

let globalOptions: Required<ScrollRevealOptions> = { ...DEFAULT_OPTIONS };
let observer: IntersectionObserver | null = null;
let isInitialized = false;

function parseAnimationAttributes(element: RevealElement): {
  animation: string;
  duration: number;
  delay: number;
  offset: number;
  easing: string;
} {
  return {
    animation: element.getAttribute('data-reveal') || 'fade-up',
    duration: parseInt(element.getAttribute('data-reveal-duration') || String(globalOptions.duration), 10),
    delay: parseInt(element.getAttribute('data-reveal-delay') || String(globalOptions.delay), 10),
    offset: parseInt(element.getAttribute('data-reveal-offset') || String(globalOptions.offset), 10),
    easing: element.getAttribute('data-reveal-easing') || globalOptions.easing
  };
}

function getInitialTransform(animation: string): string {
  const transforms: Record<string, string> = {
    'fade-up': 'translateY(20px)',
    'fade-down': 'translateY(-20px)',
    'fade-left': 'translateX(20px)',
    'fade-right': 'translateX(-20px)',
    'fade': 'none',
    'fade-in': 'none',
    'zoom-in': 'scale(0.95)',
    'zoom-out': 'scale(1.05)',
    'flip-up': 'rotateX(20deg)',
    'flip-down': 'rotateX(-20deg)',
    'flip-left': 'rotateY(20deg)',
    'flip-right': 'rotateY(-20deg)',
  };
  return transforms[animation] || transforms['fade-up'];
}

function getCubicBezier(easing: string): string {
  const bezierMap: Record<string, string> = {
    'ease-out-cubic': '0.33, 1, 0.68, 1',
    'ease-in-out': '0.4, 0, 0.2, 1',
    'ease-out': '0, 0, 0.2, 1',
    'ease-in': '0.4, 0, 1, 1',
    'linear': '0, 0, 1, 1',
  };
  return bezierMap[easing] || bezierMap['ease-out'];
}

function animateElement(element: RevealElement, entry: IntersectionObserverEntry): void {
  if (element._revealAnimated && globalOptions.once) return;

  const { animation, duration, delay, easing } = parseAnimationAttributes(element);
  const initialTransform = getInitialTransform(animation);
  const isFade = animation.includes('fade');
  const isZoom = animation.includes('zoom');
  const isMobile = isMobileDevice();

  const mobileDuration = isMobile ? Math.min(duration, 150) : duration;
  const mobileDelay = isMobile ? Math.min(delay, 20) : delay;

  const transitionProperty = isFade || isZoom ? 'opacity, transform' : 'transform';
  const cubicBezier = getCubicBezier(easing);

  requestAnimationFrame(() => {
    element.style.transition = `${transitionProperty} ${mobileDuration}ms cubic-bezier(${cubicBezier})`;
    if (mobileDelay > 0) element.style.transitionDelay = `${mobileDelay}ms`;

    if (entry.isIntersecting) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.classList.add('reveal-animated');
      element.classList.remove('reveal-init');
      element._revealAnimated = true;

      setTimeout(() => {
        element.style.willChange = 'auto';
        element.style.transition = '';
      }, mobileDuration + mobileDelay + 50);
    } else if (!globalOptions.once) {
      element.style.opacity = isFade ? '0' : '1';
      element.style.transform = initialTransform;
      element.classList.remove('reveal-animated');
      element.classList.add('reveal-init');
      element._revealAnimated = false;
    }
  });
}

function createObserver(): IntersectionObserver {
  const isMobile = isMobileDevice();
  const offset = isMobile ? Math.min(globalOptions.offset, 30) : globalOptions.offset;
  const threshold = isMobile ? 0.03 : globalOptions.threshold;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as RevealElement;
        if (entry.isIntersecting || !globalOptions.once) {
          animateElement(element, entry);
        }
      });
    },
    {
      rootMargin: `-${offset}px 0px -${offset}px 0px`,
      threshold: threshold,
    }
  );
}

function checkIfInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  const offset = globalOptions.offset;
  
  return (
    rect.top < windowHeight + offset &&
    rect.bottom > -offset &&
    rect.left < windowWidth + offset &&
    rect.right > -offset
  );
}

function applyInitialStyles(element: RevealElement, isFade: boolean, isZoom: boolean, initialTransform: string): void {
  element.style.opacity = isFade || isZoom ? '0' : '1';
  element.style.transform = initialTransform;
  element.style.willChange = 'opacity, transform';
}

function applyRevealedStyles(element: RevealElement, mobileDuration: number, mobileDelay: number): void {
  element.style.opacity = '1';
  element.style.transform = 'none';
  element.style.willChange = 'opacity, transform';
  element.classList.add('reveal-animated');
  element.classList.remove('reveal-init');
  element._revealAnimated = true;

  setTimeout(() => {
    requestAnimationFrame(() => {
      element.style.willChange = 'auto';
      element.style.transition = '';
    });
  }, mobileDuration + mobileDelay);
}

function initializeElements(): void {
  if (globalOptions.disable) return;

  const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
  if (elements.length === 0) return;

  elements.forEach((element) => {
    const { animation, duration, delay } = parseAnimationAttributes(element);
    const initialTransform = getInitialTransform(animation);
    const isFade = animation.includes('fade');
    const isZoom = animation.includes('zoom');
    const isMobile = isMobileDevice();
    const mobileDuration = isMobile ? Math.min(duration, 150) : duration;
    const mobileDelay = isMobile ? Math.min(delay, 20) : delay;

    element.classList.add('reveal-init');

    if (checkIfInViewport(element)) {
      requestAnimationFrame(() => applyRevealedStyles(element, mobileDuration, mobileDelay));
    } else {
      requestAnimationFrame(() => applyInitialStyles(element, isFade, isZoom, initialTransform));
      observer?.observe(element);
    }
  });
}

export function init(options: ScrollRevealOptions = {}): void {
  globalOptions = { ...DEFAULT_OPTIONS, ...options };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || globalOptions.disable) {
    globalOptions.disable = true;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    isInitialized = false;
    
    const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
    elements.forEach((element) => {
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.classList.add('reveal-animated');
      element.classList.remove('reveal-init');
    });
    return;
  }

  if (isInitialized && observer) {
    refresh();
    return;
  }

  observer = createObserver();
  isInitialized = true;

  const createIntersectionEntry = (element: RevealElement): IntersectionObserverEntry => {
    const rect = element.getBoundingClientRect();
    return {
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: rect,
      rootBounds: null,
      intersectionRect: rect,
      time: Date.now(),
    } as IntersectionObserverEntry;
  };

  const checkAndAnimateElements = (selector: string) => {
    document.querySelectorAll<RevealElement>(selector).forEach((element) => {
      if (!element._revealAnimated && checkIfInViewport(element)) {
        animateElement(element, createIntersectionEntry(element));
      }
    });
  };

  const initializeAndCheck = () => {
    initializeElements();
    setTimeout(() => checkAndAnimateElements('[data-reveal]'), 50);
    setTimeout(() => checkAndAnimateElements('[data-reveal].reveal-init'), 500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAndCheck, { once: true });
  } else {
    initializeAndCheck();
  }
}

export function refresh(): void {
  if (!observer || !isInitialized) return;

  const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
  elements.forEach((element) => {
    if (!element._revealAnimated || !globalOptions.once) {
      observer?.observe(element);
    }
  });
}

export function refreshWithDelay(delay: number = 150): void {
  setTimeout(() => {
    refresh();
  }, delay);
}

export function cleanup(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  isInitialized = false;
}
