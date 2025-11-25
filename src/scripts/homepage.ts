// Setup fade-in animations
export function setupHomepageAnimations(): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    document.querySelectorAll(".animate-fade-in").forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
    });
    return;
  }

  const observerOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.style.opacity = "1";

        const delay = element.getAttribute("data-animation-delay");
        if (delay) {
          element.style.animationDelay = `${delay}ms`;
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  const fadeInElements = document.querySelectorAll(".animate-fade-in");
  fadeInElements.forEach((el) => observer.observe(el));
}

