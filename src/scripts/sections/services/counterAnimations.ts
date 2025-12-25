const COUNTER_DURATION = 2000;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function animateCounter(
  element: HTMLElement,
  targetValue: number,
  originalText: string,
  hasDecimal: boolean
): void {
  const start = performance.now();

  const animate = (currentTime: number): void => {
    const progress = Math.min((currentTime - start) / COUNTER_DURATION, 1);
    const eased = easeOutQuart(progress);
    const currentValue = targetValue * eased;
    const formattedValue = hasDecimal 
      ? currentValue.toFixed(1) 
      : Math.round(currentValue).toString();

    element.textContent = originalText.replace(/[\d.]+/, formattedValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

export function setupCounterAnimations(): void {
  const counters = document.querySelectorAll('.service-outcomes-section [class*="font-extrabold"]');
  
  counters.forEach(counter => {
    if (counter.hasAttribute('data-animated')) return;
    
    const match = counter.textContent?.match(/[\d.]+/);
    if (!match) return;

    counter.setAttribute('data-animated', 'true');
    const counterEl = counter as HTMLElement;
    const originalText = counterEl.textContent || '';
    const targetValue = parseFloat(match[0]);
    const hasDecimal = match[0].includes('.');
    
    const handleAnimation = (): void => {
      animateCounter(counterEl, targetValue, originalText, hasDecimal);
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          handleAnimation();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counter);
    
    if (!counter.hasAttribute('data-reveal')) {
      counter.setAttribute('data-reveal', 'fade-up');
    }
  });
}
