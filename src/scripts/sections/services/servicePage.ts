import { setupCarouselSection } from "../utils/carouselUtils";
import { setupPageAnimations } from "../utils/pageUtils";

export function setupServicePageAnimations() {
  setupPageAnimations();

  function animateCounter(counter: Element, targetValue: number, format: string) {
    const duration = 2000;
    const start = performance.now();
    const counterEl = counter as HTMLElement;
    const originalText = counterEl.textContent || '';

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - start) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = targetValue * easeOutQuart;
      const formattedValue = format.includes('.') 
        ? currentValue.toFixed(1) 
        : Math.round(currentValue).toString();

      counterEl.textContent = originalText.replace(/[\d.]+/, formattedValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  function setupCounterAnimations() {
    const counters = document.querySelectorAll('.service-outcomes-section [class*="font-extrabold"]');
    
    counters.forEach(counter => {
      if (counter.hasAttribute('data-animated')) return;
      
      const match = counter.textContent?.match(/[\d.]+/);
      if (!match) return;

      counter.setAttribute('data-animated', 'true');
      
      // Use AOS event to trigger animation when element comes into view
      counter.addEventListener('aos:in', () => {
        animateCounter(counter, parseFloat(match[0]), match[0]);
      }, { once: true });
      
      // Also add AOS attribute if not present to ensure it triggers
      if (!counter.hasAttribute('data-aos')) {
        counter.setAttribute('data-aos', 'fade-up');
      }
    });
  }

  setupCounterAnimations();

  const carouselConfig = {
    breakpoint: 1024,
    activateOnDesktop: false,
  };

  setupCarouselSection({
    containerId: "service-process-carousel-container",
    dotSelector: ".service-process-carousel-dot",
    ...carouselConfig,
  });

  setupCarouselSection({
    containerId: "service-benefits-carousel-container",
    dotSelector: ".service-benefits-carousel-dot",
    ...carouselConfig,
  });

  function setupAccordions() {
    document.querySelectorAll('.service-accordion-item').forEach((accordion) => {
      const summary = accordion.querySelector('.service-accordion-summary');
      if (!summary) return;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        accordion.toggleAttribute('open');
      });
    });
  }

  setupAccordions();

  function setupParallax() {
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

  setupParallax();
}
