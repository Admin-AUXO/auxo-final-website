// Fade-in animation utilities

export interface FadeInOptions {
  threshold?: number;
  rootMargin?: string;
  selectors?: string[];
}

const DEFAULT_OPTIONS: Required<FadeInOptions> = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
  selectors: [
    ".fade-in-up",
    ".fade-in-up-delay",
    ".fade-in-up-delay-2",
    ".fade-in-up-delay-3",
    ".animate-fade-in",
  ],
};

export function setupFadeInObserver(
  options: FadeInOptions = {}
): IntersectionObserver {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Skip animations if user prefers reduced motion
  if (prefersReducedMotion) {
    opts.selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const element = el as HTMLElement;
        if (selector === ".animate-fade-in") {
          element.style.opacity = "1";
        } else {
          element.classList.add("animate-visible");
        }
      });
    });
    return new IntersectionObserver(() => {});
  }

  const observerOptions: IntersectionObserverInit = {
    threshold: opts.threshold,
    rootMargin: opts.rootMargin,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;

        if (element.classList.contains("animate-fade-in")) {
          element.style.opacity = "1";
          const delay = element.getAttribute("data-animation-delay");
          if (delay) {
            element.style.animationDelay = `${delay}ms`;
          }
        } else {
          element.classList.add("animate-visible");
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  opts.selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      observer.observe(el);
    });
  });

  return observer;
}

