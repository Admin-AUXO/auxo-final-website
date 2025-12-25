interface AccordionState {
  element: HTMLElement;
  summary: HTMLElement;
  isOpen: boolean;
  clickHandler: (e: MouseEvent | TouchEvent) => void;
  keyHandler: (e: KeyboardEvent) => void;
}

const accordionStates = new Map<HTMLElement, AccordionState>();

function handleAccordionToggle(accordion: HTMLElement, summary: HTMLElement, e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  
  const isOpen = accordion.hasAttribute('open');
  
  if (isOpen) {
    accordion.removeAttribute('open');
    summary.setAttribute('aria-expanded', 'false');
  } else {
    accordion.setAttribute('open', '');
    summary.setAttribute('aria-expanded', 'true');
  }
  
  accordion.dispatchEvent(new CustomEvent('accordion-toggle', { 
    detail: { isOpen: !isOpen },
    bubbles: true 
  }));
}

function setupAccordion(accordion: HTMLElement): void {
  if (accordionStates.has(accordion)) return;

  const summary = accordion.querySelector<HTMLElement>('.service-accordion-summary, .accordion-summary, [class*="-accordion-summary"], summary');
  if (!summary) return;

  const isOpen = accordion.hasAttribute('open');
  summary.setAttribute('aria-expanded', String(isOpen));
  summary.setAttribute('role', 'button');
  summary.setAttribute('tabindex', '0');
  
  if (!accordion.hasAttribute('role')) {
    accordion.setAttribute('role', 'region');
  }

  const clickHandler = (e: MouseEvent | TouchEvent) => {
    handleAccordionToggle(accordion, summary, e);
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAccordionToggle(accordion, summary, e);
    }
  };

  summary.addEventListener('click', clickHandler, { passive: false });
  summary.addEventListener('touchend', (e) => {
    e.preventDefault();
    clickHandler(e);
  }, { passive: false });
  summary.addEventListener('keydown', keyHandler);

  summary.style.touchAction = 'manipulation';
  (summary.style as any).webkitTapHighlightColor = 'transparent';

  accordionStates.set(accordion, {
    element: accordion,
    summary,
    isOpen,
    clickHandler,
    keyHandler,
  });
}

function cleanupAccordion(accordion: HTMLElement): void {
  const state = accordionStates.get(accordion);
  if (!state) return;

  state.summary.removeEventListener('click', state.clickHandler);
  state.summary.removeEventListener('touchend', state.clickHandler);
  state.summary.removeEventListener('keydown', state.keyHandler);
  
  accordionStates.delete(accordion);
}

export function initAccordions(): void {
  if (typeof document === 'undefined') return;

  const accordions = document.querySelectorAll<HTMLElement>(
    '.service-accordion-item, .accordion-item, [class*="-accordion-item"], details[class*="accordion"]'
  );
  
  accordions.forEach((accordion) => {
    setupAccordion(accordion);
  });
}

export function cleanupAccordions(): void {
  accordionStates.forEach((_, accordion) => {
    cleanupAccordion(accordion);
  });
  accordionStates.clear();
}

export function reinitAccordions(): void {
  cleanupAccordions();
  initAccordions();
}

