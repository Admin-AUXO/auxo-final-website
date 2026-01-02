import { initSmoothScroll, destroySmoothScroll } from '../smoothScroll';
import { init as initScrollAnimations, cleanup as cleanupScrollAnimations, refresh as refreshScrollAnimations } from '../utils/scrollReveal';
import { initScrollProgress, cleanupScrollProgress } from './scrollProgress';
import { initNavigation, cleanupNavigation } from './navigation';
import { initFloatingButton, cleanupFloatingButton } from './floatingButton';
import { initHeroBackground, cleanupHeroBackground } from '../utils/heroBackground';
import { initAccordions, cleanupAccordions } from '../utils/accordions';
import { cleanupAllCarousels } from '../utils/carousels';
import { autoInitCarousels } from '../sections/autoInit';
import { forceUnlockScroll } from '../navigation/utils';

let isInitialized = false;
let lazyLoadingObserver: IntersectionObserver | null = null;

function initLazyLoading(): void {
  if (lazyLoadingObserver) return;

  const lazyElements = document.querySelectorAll('[data-lazy-load]');
  if (!lazyElements.length) return;

  lazyLoadingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        el.classList.add('lazy-loaded');
        el.removeAttribute('data-lazy-load');
        lazyLoadingObserver?.unobserve(el);
      }
    });
  }, { rootMargin: '50px', threshold: 0.01 });

  lazyElements.forEach((element) => lazyLoadingObserver?.observe(element));
}

function cleanupLazyLoading(): void {
  if (lazyLoadingObserver) {
    lazyLoadingObserver.disconnect();
    lazyLoadingObserver = null;
  }
}

export function initCoreFeatures(): void {
  if (isInitialized) return;
  isInitialized = true;

  const runCriticalInit = () => {
    try {
      initSmoothScroll();
      initScrollProgress();
      initNavigation();
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Critical init error:', error);
    }
  };

  const runDeferredInit = () => {
    try {
      initScrollAnimations();
      initFloatingButton();
      initAccordions();
      initLazyLoading();
      setTimeout(() => {
        try {
          refreshScrollAnimations();
        } catch (error) {
          if (import.meta.env.DEV) console.warn('Scroll animation refresh error:', error);
        }
      }, 100);
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Deferred init error:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCriticalInit, { once: true });
  } else {
    requestAnimationFrame(runCriticalInit);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(runDeferredInit, { timeout: 1000 });
  } else {
    setTimeout(runDeferredInit, 100);
  }
}

export function initPageFeatures(): void {
  const particleCanvas = document.getElementById('particle-canvas');
  if (particleCanvas) {
    initHeroBackground();
  }

  const initCarouselsWithCSSCheck = () => {
    const checkCarouselCSS = () => {
      if (!document.body) return false;

      try {
        const testElement = document.createElement('div');
        testElement.style.cssText = 'position: absolute; visibility: hidden;';
        testElement.className = 'carousel-container';
        document.body.appendChild(testElement);

        const computedStyle = window.getComputedStyle(testElement);
        const hasCarouselCSS = computedStyle.touchAction === 'pan-x' &&
                              computedStyle.cursor === 'grab';

        testElement.remove();
        return hasCarouselCSS;
      } catch (e) {
        return false;
      }
    };

    const initializeCarousels = () => {
      try {
        autoInitCarousels();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Carousel initialization failed:', error);
        }
      }
    };

    if (checkCarouselCSS()) {
      initializeCarousels();
    } else {
      // Retry after a short delay if CSS isn't ready
      setTimeout(() => {
        if (checkCarouselCSS()) {
          initializeCarousels();
        } else {
          // Final fallback - initialize anyway
          setTimeout(initializeCarousels, 200);
        }
      }, 100);
    }
  };

  initCarouselsWithCSSCheck();

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Promise.all([
        import('../widgets/googleCalendar'),
        import('../ui/themeToggle')
      ]).then(([calendar, theme]) => {
        calendar.setupGoogleCalendar();
        theme.initThemeToggle();
      }).catch((error) => {
        if (import.meta.env.DEV) console.error('Failed to load modules:', error);
      });
    }, { timeout: 1000 });
  } else {
    setTimeout(() => {
      Promise.all([
        import('../widgets/googleCalendar'),
        import('../ui/themeToggle')
      ]).then(([calendar, theme]) => {
        calendar.setupGoogleCalendar();
        theme.initThemeToggle();
      }).catch((error) => {
        if (import.meta.env.DEV) console.error('Failed to load modules:', error);
      });
    }, 100);
  }
}

export function cleanupCoreFeatures(): void {
  forceUnlockScroll();
  cleanupScrollAnimations();
  cleanupScrollProgress();
  cleanupNavigation();
  cleanupFloatingButton();
  cleanupHeroBackground();
  cleanupAccordions();
  cleanupAllCarousels();
  cleanupLazyLoading();
  destroySmoothScroll();

  isInitialized = false;
}

export function reinitOnPageLoad(): void {
  cleanupCoreFeatures();
  setTimeout(() => {
    initCoreFeatures();
  }, 50);
}
