let parallaxElements: NodeListOf<HTMLElement> | null = null;
let parallaxCleanup: (() => void) | null = null;

function initParallax() {
  parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
  if (parallaxElements.length === 0) return;

  parallaxElements.forEach(element => {
    element.classList.add('parallax-element');
  });
}

function handleParallax(data: { scroll: number }): void {
  if (!parallaxElements) return;

  const scrollY = data.scroll * window.innerHeight;

  for (let i = 0; i < parallaxElements.length; i++) {
    const element = parallaxElements[i];
    const parallaxY = -(scrollY * (0.5 + i * 0.1));
    element.style.setProperty('--parallax-y', `${parallaxY}px`);
  }
}

export function setupParallax(): void {
  initParallax();
  if (!parallaxElements || parallaxElements.length === 0) return;

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
