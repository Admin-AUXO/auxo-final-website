let parallaxCleanup: (() => void) | null = null;

function handleParallax(data: { scroll: number }): void {
  const parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
  const scrollY = data.scroll * window.innerHeight;

  parallaxElements.forEach((element, index) => {
    const parallaxY = -(scrollY * (0.5 + index * 0.1));
    (element as HTMLElement).style.setProperty('--parallax-y', `${parallaxY}px`);
  });
}

export function setupParallax(): void {
  const parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
  if (parallaxElements.length === 0) return;

  parallaxElements.forEach(element => {
    (element as HTMLElement).classList.add('parallax-element');
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
