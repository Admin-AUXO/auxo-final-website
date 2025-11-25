// IntersectionObserver options for scroll animations
export interface AnimationObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

// Setup IntersectionObserver for animation triggers
export function createAnimationObserver(
  callback: (element: Element) => void,
  options: AnimationObserverOptions = {}
): IntersectionObserver {
  const { threshold = 0.1, rootMargin = "50px" } = options;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    },
    { threshold, rootMargin }
  );
}

// Trigger animation play state for elements
export function triggerAnimationPlayState(
  elements: NodeListOf<Element> | Element[]
): void {
  elements.forEach((el) => {
    const element = el as HTMLElement;
    element.style.animationPlayState = "running";
  });
}

// Setup staggered animation for follow content
export function setupStaggeredAnimation(
  selector: string,
  delay: number,
  action: (element: HTMLElement) => void
): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const elements = document.querySelectorAll(selector);

  elements.forEach((element, index) => {
    const el = element as HTMLElement;
    if (prefersReducedMotion) {
      action(el);
    } else {
      setTimeout(() => {
        action(el);
      }, index * delay);
    }
  });
}

