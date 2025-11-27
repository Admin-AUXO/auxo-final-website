import { setupCarouselSection } from "../utils/carouselUtils";
import { setupPageAnimations } from "../utils/pageUtils";

// Service page animations and interactions
export function setupServicePageAnimations() {
  // Use consolidated page animations (fade-in and smooth scroll)
  setupPageAnimations();

  // Enhanced hover effects for service cards
  document.querySelectorAll('.service-card-redesigned').forEach(card => {
    const cardElement = card as HTMLElement;
    
    cardElement.addEventListener('mouseenter', () => {
      // Add subtle animation to sibling cards
      const siblings = card.parentElement?.querySelectorAll('.service-card-redesigned');
      siblings?.forEach(sibling => {
        if (sibling !== card) {
          const siblingElement = sibling as HTMLElement;
          siblingElement.style.transform = 'scale(0.98)';
          siblingElement.style.opacity = '0.7';
        }
      });
    });

    cardElement.addEventListener('mouseleave', () => {
      // Reset sibling cards
      const siblings = card.parentElement?.querySelectorAll('.service-card-redesigned');
      siblings?.forEach(sibling => {
        if (sibling !== card) {
          const siblingElement = sibling as HTMLElement;
          siblingElement.style.transform = '';
          siblingElement.style.opacity = '';
        }
      });
    });
  });

  // Process step hover effects
  document.querySelectorAll('.service-process-section [class*="group"]').forEach(step => {
    step.addEventListener('mouseenter', () => {
      // Add connecting line animation effect
      const connectionLine = step.closest('.service-process-section')?.querySelector('.bg-gradient-to-r');
      if (connectionLine) {
        (connectionLine as HTMLElement).style.background = 'linear-gradient(to right, transparent, var(--accent-green), transparent)';
      }
    });

    step.addEventListener('mouseleave', () => {
      // Reset connecting line
      const connectionLine = step.closest('.service-process-section')?.querySelector('.bg-gradient-to-r');
      if (connectionLine) {
        (connectionLine as HTMLElement).style.background = '';
      }
    });
  });

  // Metric counter animation
  const animateCounters = () => {
    document.querySelectorAll('.service-outcomes-section [class*="font-extrabold"]').forEach(counter => {
      const target = counter.textContent?.match(/[\d.]+/)?.[0];
      if (target && !counter.hasAttribute('data-animated')) {
        counter.setAttribute('data-animated', 'true');
        const targetValue = parseFloat(target);
        const duration = 2000;
        const start = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = targetValue * easeOutQuart;

          if (target.includes('.')) {
            counter.textContent = counter.textContent!.replace(/[\d.]+/, currentValue.toFixed(1));
          } else if (target.includes('%')) {
            counter.textContent = counter.textContent!.replace(/[\d.]+/, Math.round(currentValue).toString());
          } else {
            counter.textContent = counter.textContent!.replace(/[\d.]+/, Math.round(currentValue).toString());
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        // Start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              requestAnimationFrame(animate);
              observer.unobserve(entry.target);
            }
          });
        });
        observer.observe(counter);
      }
    });
  };

  // Initialize counter animations
  animateCounters();

  // Initialize carousels with unified configuration
  const processCarouselManager = setupCarouselSection({
    containerId: "service-process-carousel-container",
    dotSelector: ".service-process-carousel-dot",
    breakpoint: 1024,
    activateOnDesktop: false,
  });

  const benefitsCarouselManager = setupCarouselSection({
    containerId: "service-benefits-carousel-container",
    dotSelector: ".service-benefits-carousel-dot",
    breakpoint: 1024,
    activateOnDesktop: false,
  });

  // Initialize carousels only if containers exist
  const processContainer = document.getElementById("service-process-carousel-container");
  const benefitsContainer = document.getElementById("service-benefits-carousel-container");

  if (processContainer) {
    processCarouselManager.initWithDelay();
  }

  if (benefitsContainer) {
    benefitsCarouselManager.initWithDelay();
  }

  // Accordion functionality for mobile
  document.querySelectorAll('.service-accordion-item').forEach((accordion) => {
    const summary = accordion.querySelector('.service-accordion-summary');
    if (summary) {
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = accordion.hasAttribute('open');
        if (isOpen) {
          accordion.removeAttribute('open');
        } else {
          accordion.setAttribute('open', '');
        }
      });
    }
  });

  // Add scroll-based parallax effects
  let lastScrollY = window.scrollY;
  const parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');

  const handleParallax = () => {
    const scrollY = window.scrollY;
    const deltaY = scrollY - lastScrollY;

    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrollY * speed);
      (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
    });

    lastScrollY = scrollY;
  };

  // Throttle scroll events
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}
