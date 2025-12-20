export function setupParallax(): void {
  const parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
  if (parallaxElements.length === 0) return;

  parallaxElements.forEach(element => {
    (element as HTMLElement).classList.add('parallax-element');
  });

  let ticking = false;

  const handleParallax = () => {
    const scrollY = window.scrollY;
    parallaxElements.forEach((element, index) => {
      const parallaxY = -(scrollY * (0.5 + index * 0.1));
      (element as HTMLElement).style.setProperty('--parallax-y', `${parallaxY}px`);
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleParallax);
      ticking = true;
    }
  }, { passive: true });
}
