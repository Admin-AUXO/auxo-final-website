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
import { initWebVitals } from '../utils/webVitals';
import { initGA4Tracking } from '../analytics/ga4';
import { initInteractionTracking } from '../analytics/navigationTracking';

let isInitialized = false;
let lazyLoadingObserver: IntersectionObserver | null = null;
let ga4Cleanup: (() => void) | null = null;
let interactionCleanup: (() => void) | null = null;

function initLazyLoading(): void {
  if (lazyLoadingObserver) return;

  const lazyElements = document.querySelectorAll('[data-lazy-load]');
  if (!lazyElements.length) return;

  const immediateLoadCount = Math.min(2, lazyElements.length);
  for (let i = 0; i < immediateLoadCount; i++) {
    const el = lazyElements[i] as HTMLElement;
    el.classList.add('lazy-loaded');
    el.removeAttribute('data-lazy-load');
  }

  const remainingElements = Array.from(lazyElements).slice(immediateLoadCount);
  if (remainingElements.length === 0) return;

  const isMobile = window.innerWidth < 768;
  const rootMargin = isMobile ? '100px' : '200px';

  lazyLoadingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        requestAnimationFrame(() => {
          el.classList.add('lazy-loaded');
          el.removeAttribute('data-lazy-load');
        });
        lazyLoadingObserver?.unobserve(el);
      }
    });
  }, {
    rootMargin,
    threshold: 0.01
  });

  remainingElements.forEach((element) => lazyLoadingObserver?.observe(element));
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

  initWebVitals();

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

      ga4Cleanup = initGA4Tracking();
      interactionCleanup = initInteractionTracking();

      setTimeout(() => {
        try {
          refreshScrollAnimations();
        } catch (error) {
          if (import.meta.env.DEV) console.warn('Scroll animation refresh error:', error);
        }
      }, 50);
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
      } catch {
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
      setTimeout(() => {
        if (checkCarouselCSS()) {
          initializeCarousels();
        } else {
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

  if (ga4Cleanup) {
    ga4Cleanup();
    ga4Cleanup = null;
  }

  if (interactionCleanup) {
    interactionCleanup();
    interactionCleanup = null;
  }

  isInitialized = false;
}

export function reinitOnPageLoad(): void {
  cleanupCoreFeatures();
  setTimeout(() => {
    initCoreFeatures();
  }, 50);
}
