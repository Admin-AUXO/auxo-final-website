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

  return () => {};
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

const defaultScrollConfig = {
  touchAction: 'pan-y' as const,
  overscrollBehavior: 'contain' as const,
  momentumScrolling: true
};

export function initTouchScrolling(): void {
  if (typeof document === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isMobile) {
    if (isAndroid) {
      const androidScrollConfig = {
        touchAction: 'pan-y' as const,
        overscrollBehavior: 'contain' as const,
        momentumScrolling: true
      };
      setupEnhancedScrolling(document.body, androidScrollConfig);
      setupEnhancedScrolling(document.documentElement, androidScrollConfig);
    } else {
      setupEnhancedScrolling(document.body, defaultScrollConfig);
      setupEnhancedScrolling(document.documentElement, defaultScrollConfig);
    }
  }

  document.querySelectorAll('[data-modal-content]').forEach((element) =>
    setupEnhancedScrolling(element as HTMLElement, defaultScrollConfig)
  );

  document.querySelectorAll('[data-scrollable-iframe]').forEach((element) =>
    setupEnhancedScrolling(element as HTMLElement, defaultScrollConfig)
  );

  document.querySelectorAll('[data-scroll-indicators]').forEach((container) => {
    const element = container as HTMLElement;
    setupEnhancedScrolling(element, defaultScrollConfig);

    const topIndicator = container.querySelector('[data-scroll-indicator-top]') as HTMLElement;
    const bottomIndicator = container.querySelector('[data-scroll-indicator-bottom]') as HTMLElement;
    setupScrollIndicators(element, topIndicator, bottomIndicator);
  });

  if (isMobile) {
    document.querySelectorAll('[class*="overflow"]').forEach((element) => {
      const el = element as HTMLElement;
      const computedStyle = getComputedStyle(el);

      // Check if element needs horizontal scrolling
      const needsHorizontalScroll = el.classList.contains('process-stepper-wrapper') ||
        el.classList.contains('overflow-x-auto') ||
        computedStyle.overflowX === 'auto' || computedStyle.overflowX === 'scroll' ||
        el.className.includes('horizontal-scroll') || el.className.includes('scroll-x');

      if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' ||
          computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
        if (needsHorizontalScroll) {
          setupEnhancedScrolling(el, { ...defaultScrollConfig, touchAction: 'pan-x pan-y' });
        } else {
          setupEnhancedScrolling(el, defaultScrollConfig);
        }
      }
    });
  }
}