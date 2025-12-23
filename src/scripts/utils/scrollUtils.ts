interface ScrollConfig {
  touchAction?: string;
  overscrollBehavior?: string;
  momentumScrolling?: boolean;
}

export function setupEnhancedScrolling(element: HTMLElement, config: ScrollConfig = {}): () => void {
  const { touchAction = 'pan-y', overscrollBehavior = 'contain', momentumScrolling = true } = config;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Enhanced scrolling properties for better performance
  element.style.touchAction = touchAction;
  element.style.overscrollBehavior = overscrollBehavior;

  // On mobile, let native scrolling handle smoothness
  if (isMobile) {
    element.style.scrollBehavior = 'auto'; // Let momentum handle it
  } else {
    element.style.scrollBehavior = 'smooth';
  }

  if (momentumScrolling) {
    (element.style as any).webkitOverflowScrolling = 'touch';
    // Additional properties for better momentum scrolling
    element.style.WebkitMomentumScrolling = 'auto';
    element.style.MozMomentumScrolling = 'auto';
  }

  // Prevent scroll chaining and improve touch responsiveness
  element.style.willChange = 'scroll-position';
  element.style.transform = 'translateZ(0)'; // Force hardware acceleration

  // On mobile, don't add scroll listeners that might interfere with momentum
  if (!isMobile) {
    const handleScroll = () => {
      // Force reflow to ensure smooth scrolling on desktop
      element.offsetHeight;
    };
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      // Cleanup styles
      element.style.willChange = '';
      element.style.transform = '';
    };
  }

  // Mobile cleanup (no scroll listener)
  return () => {
    element.style.willChange = '';
    element.style.transform = '';
  };
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

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Enhanced scrolling for modal content
  document.querySelectorAll('[data-modal-content]').forEach((element) => {
    setupEnhancedScrolling(element as HTMLElement, {
      touchAction: 'pan-y',
      overscrollBehavior: 'contain',
      momentumScrolling: true
    });
  });

  // Enhanced scrolling for scrollable iframes
  document.querySelectorAll('[data-scrollable-iframe]').forEach((element) => {
    setupEnhancedScrolling(element as HTMLElement, {
      touchAction: 'pan-y',
      overscrollBehavior: 'contain',
      momentumScrolling: true
    });
  });

  // Enhanced scrolling for elements with custom scroll indicators (desktop only)
  if (!isMobile) {
    document.querySelectorAll('[data-scroll-indicators]').forEach((container) => {
      const element = container as HTMLElement;
      setupEnhancedScrolling(element, {
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        momentumScrolling: true
      });

      const topIndicator = container.querySelector('[data-scroll-indicator-top]') as HTMLElement;
      const bottomIndicator = container.querySelector('[data-scroll-indicator-bottom]') as HTMLElement;
      setupScrollIndicators(element, topIndicator, bottomIndicator);
    });
  }

  // Enhanced scrolling for any element with scroll-touch class
  document.querySelectorAll('.scroll-touch, .scroll-touch-y').forEach((element) => {
    setupEnhancedScrolling(element as HTMLElement, {
      touchAction: 'pan-y',
      overscrollBehavior: 'contain',
      momentumScrolling: true
    });
  });

  // On mobile, be more selective about which elements get enhanced scrolling
  // to avoid interfering with native momentum scrolling
  if (!isMobile) {
    document.querySelectorAll('[style*="overflow"]:not([data-modal-content]):not([data-scrollable-iframe]):not([data-scroll-indicators])').forEach((element) => {
      const el = element as HTMLElement;
      const computedStyle = getComputedStyle(el);

      if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' ||
          computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
        setupEnhancedScrolling(el, {
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          momentumScrolling: true
        });
      }
    });
  }
}