// Cache elements once
let parallaxElements: NodeListOf<HTMLElement> | null = null;

function initParallax() {
  parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
}

function handleParallax(data: { scroll: number }): void {
  if (!parallaxElements) return; // Guard clause

  const scrollY = data.scroll * window.innerHeight;

  // Use a standard for loop for better performance than forEach on mobile
  for (let i = 0; i < parallaxElements.length; i++) {
    const element = parallaxElements[i];
    const parallaxY = -(scrollY * (0.5 + i * 0.1));
    element.style.setProperty('--parallax-y', `${parallaxY}px`);
  }
}

let parallaxCleanup: (() => void) | null = null;

export function setupParallax(): void {
  initParallax();
  if (!parallaxElements || parallaxElements.length === 0) return;

  parallaxElements.forEach(element => {
    element.classList.add('parallax-element');
  });

  const lenisInstance = (window as any).__lenis;
  if (lenisInstance) {
    lenisInstance.on('scroll', handleParallax);
    parallaxCleanup = () => lenisInstance.off('scroll', handleParallax);
  } else {
    console.warn('Lenis not available for parallax effects');
  }
}

export function cleanupParallax(): void {
  if (parallaxCleanup) {
    parallaxCleanup();
    parallaxCleanup = null;
  }
}
