// High-performance smooth scrolling implementation with device optimization
export function initSmoothScroll() {
  // Performance optimization: Use passive listeners where possible
  const scrollOptions = { passive: true, capture: false };

  // Handle anchor links with optimized smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        e.preventDefault();
        scrollToElement(target, { offset: 0 });
      }
    }, scrollOptions);
  });

  // Handle hash on page load (Astro view transitions)
  document.addEventListener('astro:page-load', () => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setTimeout(() => {
          const target = document.querySelector(hash) as HTMLElement;
          if (target) {
            scrollToElement(target, { offset: 0 });
          }
        }, 150); // Slightly longer delay for Astro transitions
      });
    }
  });

  // Performance: Reduce scroll event frequency on mobile
  let scrollTimeout: NodeJS.Timeout;
  const handleScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Scroll performance optimizations can be added here
    }, 16); // ~60fps
  };

  window.addEventListener('scroll', handleScroll, scrollOptions);
}

export function stopSmoothScroll() {
  // No-op - native smooth scrolling doesn't need to be stopped
}

export function startSmoothScroll() {
  // No-op - native smooth scrolling doesn't need to be started
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) {
  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (!element) return;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const offset = options?.offset || 0;

  if (options?.immediate) {
    // Immediate scroll for critical navigation
    element.scrollIntoView({
      behavior: 'instant',
      block: 'start'
    });
    return;
  }

  // Performance optimization: Use native smooth scrolling when available
  if ('scrollBehavior' in document.documentElement.style) {
    try {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } catch (error) {
      // Fallback if scrollIntoView fails
      fallbackScroll(element, offset);
    }
  } else {
    fallbackScroll(element, offset);
  }

  // Performance: Add scroll performance monitoring
  let scrollStartTime = Date.now();
  let scrollEndTimeout: NodeJS.Timeout;

  const handleScrollEnd = () => {
    if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
    scrollEndTimeout = setTimeout(() => {
      // Scroll performance logging (dev only)
      if (import.meta.env.DEV) {
        const scrollDuration = Date.now() - scrollStartTime;
        console.log(`Scroll completed in ${scrollDuration}ms`);
      }
    }, 150);
  };

  window.addEventListener('scroll', handleScrollEnd, { passive: true, once: false });
  // Clean up after animation completes
  setTimeout(() => {
    window.removeEventListener('scroll', handleScrollEnd);
  }, 2000);
}

function fallbackScroll(element: HTMLElement, offset: number) {
  // Enhanced fallback with easing for better UX
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  const startPosition = window.pageYOffset;
  const distance = offsetPosition - startPosition;

  if (Math.abs(distance) < 1) return; // Already at position

  const duration = Math.min(Math.max(Math.abs(distance) / 2, 300), 1000); // Adaptive duration
  let startTime: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    const easeProgress = easeInOutCubic(progress);
    const currentPosition = startPosition + (distance * easeProgress);

    window.scrollTo(0, currentPosition);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export function destroySmoothScroll() {
  // No-op - native smooth scrolling doesn't need cleanup
}

export function getLenis(): null {
  return null; // Lenis is removed
}

export function isSmoothScrollEnabled(): boolean {
  return true; // Native smooth scrolling is always enabled
}
