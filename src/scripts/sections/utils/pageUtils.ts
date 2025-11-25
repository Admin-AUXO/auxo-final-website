// IntersectionObserver for fade-in elements
function setupFadeInObserver(): void {
  const observerOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll(
    ".fade-in-up, .fade-in-up-delay, .fade-in-up-delay-2, .fade-in-up-delay-3"
  );

  fadeElements.forEach((el) => {
    observer.observe(el);
  });
}

// Setup smooth scroll for anchor links
function setupSmoothScroll(): void {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const navHeight = 80;

  anchorLinks.forEach((link) => {
    const newLink = link.cloneNode(true) as HTMLAnchorElement;
    link.parentNode?.replaceChild(newLink, link);

    newLink.addEventListener("click", (e) => {
      const href = newLink.getAttribute("href");
      if (href && href !== "#" && href.startsWith("#")) {
        const targetId = href.substring(1);
        const target = document.getElementById(targetId) || document.querySelector(href);
        if (target) {
          e.preventDefault();
          e.stopPropagation();

          const targetPosition =
            target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

// Setup page animations and interactions
export function setupPageAnimations(carouselInitFns: (() => void)[] = []): void {
  setupFadeInObserver();
  setupSmoothScroll();

  // Initialize carousels with delay
  if (carouselInitFns.length > 0) {
    setTimeout(() => {
      carouselInitFns.forEach((fn) => fn());
    }, 100);
  }
}

