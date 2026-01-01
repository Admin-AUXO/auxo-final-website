import { isMobileDevice } from './deviceDetection';

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

  return () => {
    element.style.touchAction = '';
    element.style.overscrollBehavior = '';
    (element.style as any).webkitOverflowScrolling = '';
  };
}

export function setupScrollIndicators(container: HTMLElement, indicatorTop?: HTMLElement, indicatorBottom?: HTMLElement): () => void {
  if (!indicatorTop && !indicatorBottom) return () => {};

  const updateIndicators = () => {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const shouldShowTop = scrollTop > 20;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (indicatorTop) {
      indicatorTop.classList.toggle('visible', shouldShowTop);
    }
    if (indicatorBottom) {
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

  const isMobile = isMobileDevice();
  if (!isMobile) return;

  document.querySelectorAll('[data-modal-content], [data-scrollable-iframe]').forEach((element) => {
    const el = element as HTMLElement;
    setupScrollIndicators(el);
  });
}