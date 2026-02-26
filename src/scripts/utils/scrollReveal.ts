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

const TRANSFORM_MAP: Record<string, string> = {
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

const EASING_MAP: Record<string, string> = {
  'ease-out-cubic': '0.33, 1, 0.68, 1',
  'ease-in-out': '0.4, 0, 0.2, 1',
  'ease-out': '0, 0, 0.2, 1',
  'ease-in': '0.4, 0, 1, 1',
  'linear': '0, 0, 1, 1',
};

const elementState = new WeakMap<HTMLElement, {
  animation: string;
  duration: number;
  delay: number;
  offset: number;
  easing: string;
  initialTransform: string;
  isFadeOrZoom: boolean;
}>();

let globalOptions: Required<ScrollRevealOptions> = { ...DEFAULT_OPTIONS };
let observer: IntersectionObserver | null = null;
let isInitialized = false;

function getElementConfig(element: HTMLElement) {
  let config = elementState.get(element);
  if (!config) {
    const animation = element.getAttribute('data-reveal') || 'fade-up';
    const duration = parseInt(element.getAttribute('data-reveal-duration') || String(globalOptions.duration), 10);
    const delay = parseInt(element.getAttribute('data-reveal-delay') || String(globalOptions.delay), 10);
    const offset = parseInt(element.getAttribute('data-reveal-offset') || String(globalOptions.offset), 10);
    const easing = element.getAttribute('data-reveal-easing') || globalOptions.easing;
    
    config = {
      animation,
      duration,
      delay,
      offset,
      easing,
      initialTransform: TRANSFORM_MAP[animation] || TRANSFORM_MAP['fade-up'],
      isFadeOrZoom: animation.includes('fade') || animation.includes('zoom')
    };
    elementState.set(element, config);
  }
  return config;
}

function animateElement(element: RevealElement, isIntersecting: boolean): void {
  if (element._revealAnimated && globalOptions.once && isIntersecting) return;

  const config = getElementConfig(element);
  const isMobile = isMobileDevice();

  const finalDuration = isMobile ? Math.min(config.duration, 150) : config.duration;
  const finalDelay = isMobile ? Math.min(config.delay, 20) : config.delay;

  const transitionProperty = config.isFadeOrZoom ? 'opacity, transform' : 'transform';
  const cubicBezier = EASING_MAP[config.easing] || EASING_MAP['ease-out'];

  requestAnimationFrame(() => {
    element.style.transition = `${transitionProperty} ${finalDuration}ms cubic-bezier(${cubicBezier})`;
    if (finalDelay > 0) element.style.transitionDelay = `${finalDelay}ms`;

    if (isIntersecting) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.classList.add('reveal-animated');
      element.classList.remove('reveal-init');
      element._revealAnimated = true;

      setTimeout(() => {
        element.style.willChange = 'auto';
        element.style.transition = '';
      }, finalDuration + finalDelay + 50);
    } else if (!globalOptions.once) {
      element.style.opacity = config.animation.includes('fade') ? '0' : '1';
      element.style.transform = config.initialTransform;
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
        if (entry.isIntersecting || !globalOptions.once) {
          animateElement(entry.target as RevealElement, entry.isIntersecting);
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
    
    document.querySelectorAll<RevealElement>('[data-reveal]').forEach((element) => {
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

  const elements = document.querySelectorAll<RevealElement>('[data-reveal]');
  if (elements.length === 0) return;

  elements.forEach((element) => {
    const config = getElementConfig(element);
    element.classList.add('reveal-init');

    if (checkIfInViewport(element)) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.classList.add('reveal-animated');
      element.classList.remove('reveal-init');
      element._revealAnimated = true;
    } else {
      element.style.opacity = config.isFadeOrZoom ? '0' : '1';
      element.style.transform = config.initialTransform;
      element.style.willChange = 'opacity, transform';
      observer?.observe(element);
    }
  });
}

export function refresh(): void {
  if (!observer || !isInitialized) return;

  document.querySelectorAll<RevealElement>('[data-reveal]').forEach((element) => {
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
