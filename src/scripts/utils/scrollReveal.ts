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
  duration: 500,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80,
  delay: 0,
  disable: false,
  threshold: 0.1,
};

let globalOptions: Required<ScrollRevealOptions> = { ...DEFAULT_OPTIONS };
let observer: IntersectionObserver | null = null;
let isInitialized = false;

const EASING_FUNCTIONS: Record<string, (t: number) => number> = {
  'ease-out-cubic': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
  'ease-in': (t: number) => t * t,
  'linear': (t: number) => t,
};

function getEasingFunction(easing: string): (t: number) => number {
  return EASING_FUNCTIONS[easing] || EASING_FUNCTIONS['ease-out-cubic'];
}

function parseAnimationAttributes(element: RevealElement): {
  animation: string;
  duration: number;
  delay: number;
  offset: number;
  easing: string;
} {
  const animation = element.getAttribute('data-reveal') || 'fade-up';
  const duration = parseInt(element.getAttribute('data-reveal-duration') || 
                           String(globalOptions.duration), 10);
  const delay = parseInt(element.getAttribute('data-reveal-delay') || 
                        String(globalOptions.delay), 10);
  const offset = parseInt(element.getAttribute('data-reveal-offset') || 
                         String(globalOptions.offset), 10);
  const easing = element.getAttribute('data-reveal-easing') || 
                globalOptions.easing;

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

function animateElement(element: RevealElement, entry: IntersectionObserverEntry): void {
  if (element._revealAnimated && globalOptions.once) return;

  const { animation, duration, delay, easing } = parseAnimationAttributes(element);
  const initialTransform = getInitialTransform(animation);
  const isFade = animation.includes('fade');
  const isZoom = animation.includes('zoom');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const mobileDuration = isMobile ? Math.min(duration, 300) : duration;
  const mobileDelay = isMobile ? Math.min(delay, 50) : delay;

  const transitionProperty = isFade || isZoom ? 'opacity, transform' : 'transform';
  const cubicBezier = getCubicBezier(easing);

  element.style.transition = `${transitionProperty} ${mobileDuration}ms cubic-bezier(${cubicBezier})`;

  if (mobileDelay > 0) {
    element.style.transitionDelay = `${mobileDelay}ms`;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (entry.isIntersecting) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.classList.add('reveal-animated');
        element.classList.remove('reveal-init');
        element._revealAnimated = true;

        setTimeout(() => {
          element.style.willChange = 'auto';
          element.style.transition = '';
        }, mobileDuration + mobileDelay);
      } else if (!globalOptions.once) {
        element.style.opacity = isFade ? '0' : '1';
        element.style.transform = initialTransform;
        element.classList.remove('reveal-animated');
        element.classList.add('reveal-init');
        element._revealAnimated = false;
      }
    });
  });
}

function getCubicBezier(easing: string): string {
  const bezierMap: Record<string, string> = {
    'ease-out-cubic': '0.33, 1, 0.68, 1',
    'ease-in-out': '0.42, 0, 0.58, 1',
    'ease-out': '0, 0, 0.58, 1',
    'ease-in': '0.42, 0, 1, 1',
    'linear': '0, 0, 1, 1',
  };
  return bezierMap[easing] || bezierMap['ease-out-cubic'];
}

function createObserver(): IntersectionObserver {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const offset = isMobile ? Math.min(globalOptions.offset, 40) : globalOptions.offset;
  const threshold = isMobile ? 0.05 : globalOptions.threshold;

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

function initializeElements(): void {
  if (globalOptions.disable) return;

  const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
  
  if (elements.length === 0) return;
  
  elements.forEach((element) => {
    const { animation } = parseAnimationAttributes(element);
    const initialTransform = getInitialTransform(animation);
    const isFade = animation.includes('fade');
    const isZoom = animation.includes('zoom');

    element.classList.add('reveal-init');
    element.style.opacity = isFade || isZoom ? '0' : '1';
    element.style.transform = initialTransform;
    element.style.willChange = 'opacity, transform';

    if (observer) {
      observer.observe(element);
    }
  });
}

function setupScrollIntegration(): void {
  // Scroll animations handled via IntersectionObserver
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
    return;
  }

  if (isInitialized && observer) {
    refresh();
    return;
  }

  observer = createObserver();
  isInitialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeElements, { once: true });
  } else {
    initializeElements();
  }

  setupScrollIntegration();

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


