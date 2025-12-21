interface ScrollConfig {
  touchAction?: string;
  overscrollBehavior?: string;
  momentumScrolling?: boolean;
}

export function setupEnhancedScrolling(element: HTMLElement, config: ScrollConfig = {}): () => void {
  const { touchAction = 'pan-y', overscrollBehavior = 'contain', momentumScrolling = true } = config;

  element.style.touchAction = touchAction;
  element.style.overscrollBehavior = overscrollBehavior;

  if (momentumScrolling) {
    (element.style as any).webkitOverflowScrolling = 'touch';
  }

  return () => {}; // No cleanup needed for CSS-only changes
}

export function setupScrollIndicators(container: HTMLElement, indicatorTop?: HTMLElement, indicatorBottom?: HTMLElement): () => void {
  if (!indicatorTop && !indicatorBottom) return () => {};

  const updateIndicators = () => {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (indicatorTop) {
      indicatorTop.classList.toggle('visible', scrollTop > 20);
    }
    if (indicatorBottom) {
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
      indicatorBottom.classList.toggle('visible', !isAtBottom);
    }
  };

  container.addEventListener('scroll', updateIndicators, { passive: true });
  updateIndicators();

  return () => container.removeEventListener('scroll', updateIndicators);
}

export function initTouchScrolling(): void {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-modal-content]').forEach((element) => {
    setupEnhancedScrolling(element as HTMLElement, { touchAction: 'pan-y', overscrollBehavior: 'contain' });
  });

  document.querySelectorAll('[data-scrollable-iframe]').forEach((element) => {
    setupEnhancedScrolling(element as HTMLElement, { touchAction: 'pan-y', overscrollBehavior: 'contain' });
  });

  document.querySelectorAll('[data-scroll-indicators]').forEach((container) => {
    const topIndicator = container.querySelector('[data-scroll-indicator-top]') as HTMLElement;
    const bottomIndicator = container.querySelector('[data-scroll-indicator-bottom]') as HTMLElement;
    setupScrollIndicators(container as HTMLElement, topIndicator, bottomIndicator);
  });
}