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
  const animation = element.getAttribute('data-reveal') || 'fade-up';
  const duration = parseInt(element.getAttribute('data-reveal-duration') || String(globalOptions.duration), 10);
  const delay = parseInt(element.getAttribute('data-reveal-delay') || String(globalOptions.delay), 10);
  const offset = parseInt(element.getAttribute('data-reveal-offset') || String(globalOptions.offset), 10);
  const easing = element.getAttribute('data-reveal-easing') || globalOptions.easing;

  return { animation, duration, delay, offset, easing };
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

    if (mobileDelay > 0) {
      element.style.transitionDelay = `${mobileDelay}ms`;
    }
  });

  requestAnimationFrame(() => {
    if (entry.isIntersecting) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.classList.add('reveal-animated');
      element.classList.remove('reveal-init');
      element._revealAnimated = true;

      setTimeout(() => {
        requestAnimationFrame(() => {
          element.style.willChange = 'auto';
          element.style.transition = '';
        });
      }, mobileDuration + mobileDelay);
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

function initializeElements(): void {
  if (globalOptions.disable) return;

  const elements = document.querySelectorAll<RevealElement>('[data-reveal]');

  if (elements.length === 0) return;

  elements.forEach((element) => {
    const { animation, duration, delay, easing } = parseAnimationAttributes(element);
    const initialTransform = getInitialTransform(animation);
    const isFade = animation.includes('fade');
    const isZoom = animation.includes('zoom');
    const isMobile = isMobileDevice();
    const mobileDuration = isMobile ? Math.min(duration, 150) : duration;
    const mobileDelay = isMobile ? Math.min(delay, 20) : delay;

    const isAlreadyInViewport = checkIfInViewport(element);

    element.classList.add('reveal-init');
    
    if (isAlreadyInViewport) {
      requestAnimationFrame(() => {
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
      });
    } else {
      requestAnimationFrame(() => {
        element.style.opacity = isFade || isZoom ? '0' : '1';
        element.style.transform = initialTransform;
        element.style.willChange = 'opacity, transform';
      });

      if (observer) {
        observer.observe(element);
      }
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

  const initializeAndCheck = () => {
    initializeElements();
    
    setTimeout(() => {
      const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
      elements.forEach((element) => {
        if (!element._revealAnimated && checkIfInViewport(element)) {
          const rect = element.getBoundingClientRect();
          const entry = {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: rect,
            rootBounds: null,
            intersectionRect: rect,
            time: Date.now(),
          } as IntersectionObserverEntry;
          animateElement(element, entry);
        }
      });
    }, 50);
    
    setTimeout(() => {
      const elements = document.querySelectorAll<RevealElement>('[data-reveal].reveal-init');
      elements.forEach((element) => {
        if (checkIfInViewport(element)) {
          const rect = element.getBoundingClientRect();
          const entry = {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: rect,
            rootBounds: null,
            intersectionRect: rect,
            time: Date.now(),
          } as IntersectionObserverEntry;
          animateElement(element, entry);
        }
      });
    }, 500);
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
