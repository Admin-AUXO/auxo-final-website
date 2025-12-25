export function setupAccordions(): void {
  const accordions = document.querySelectorAll<HTMLElement>('.service-accordion-item, .accordion-item, [class*="-accordion-item"]');
  
  accordions.forEach((accordion) => {
    const summary = accordion.querySelector<HTMLElement>('.service-accordion-summary, .accordion-summary, [class*="-accordion-summary"]');
    if (!summary) return;

    const handleClick = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = accordion.hasAttribute('open');
      
      if (isOpen) {
        accordion.removeAttribute('open');
      } else {
        accordion.setAttribute('open', '');
      }
      
      accordion.dispatchEvent(new CustomEvent('accordion-toggle', { 
        detail: { isOpen: !isOpen },
        bubbles: true 
      }));
    };

    summary.addEventListener('click', handleClick, { passive: false });
    summary.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleClick(e);
    }, { passive: false });

    summary.style.touchAction = 'manipulation';
    (summary.style as any).webkitTapHighlightColor = 'transparent';
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAccordions);
  } else {
    setupAccordions();
  }

  document.addEventListener('astro:page-load', setupAccordions);
}
