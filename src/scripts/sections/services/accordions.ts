export function setupAccordions(): void {
  document.querySelectorAll('.service-accordion-item').forEach((accordion) => {
    const summary = accordion.querySelector('.service-accordion-summary');
    if (!summary) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      accordion.toggleAttribute('open');
    });
  });
}
