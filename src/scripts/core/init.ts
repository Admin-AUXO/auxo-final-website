import { initSmoothScroll, destroySmoothScroll } from '../smoothScroll';
import { init as initScrollAnimations, cleanup as cleanupScrollAnimations, refresh as refreshScrollAnimations } from '../utils/scrollReveal';
import { initScrollProgress, cleanupScrollProgress } from './scrollProgress';
import { initNavigation, cleanupNavigation } from '../navigation/index';
import { initFloatingButton, cleanupFloatingButton } from './floatingButton';
import { initHeroBackground, cleanupHeroBackground } from '../utils/heroBackground';
import { initAccordions, cleanupAccordions } from '../utils/accordions';
import { cleanupAllCarousels } from '../utils/carousels';
import { autoInitCarousels, resetAutoInitState } from '../sections/autoInit';
import { forceUnlockScroll } from '../navigation/utils';
import { initWebVitals } from '../utils/webVitals';
import { initConditionalAnalytics, cleanupConditionalAnalytics } from '../analytics/conditionalLoader';
import { initKeyboardNavigation, cleanupKeyboardNavigation } from '../utils/keyboardNavigation';
import { registerServiceWorker } from './serviceWorker';
import { logger } from '@/lib/logger';

let isInitialized = false;

function initLazyLoading(): void {
  const lazyElements = document.querySelectorAll('[data-lazy-load]');
  if (!lazyElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        el.classList.add('lazy-loaded');
        el.removeAttribute('data-lazy-load');
        observer.unobserve(el);
      }
    });
  }, {
    rootMargin: '100px',
    threshold: 0.01
  });

  lazyElements.forEach((el) => observer.observe(el));
}

export function initCoreFeatures(): void {
  if (isInitialized) return;
  isInitialized = true;

  initWebVitals();

  const runCriticalInit = () => {
    try {
      initKeyboardNavigation();
      initSmoothScroll();
      initScrollProgress();
      initNavigation();
      initScrollAnimations();
      initLazyLoading();
    } catch (error) {
      logger.warn('Critical init error:', error);
    }
  };

  const runDeferredInit = () => {
    try {
      initFloatingButton();
      initAccordions();
      initConditionalAnalytics();
      registerServiceWorker();

      setTimeout(() => {
        try {
          refreshScrollAnimations();
        } catch (error) {
          logger.warn('Scroll animation refresh error:', error);
        }
      }, 50);
    } catch (error) {
      logger.warn('Deferred init error:', error);
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
    try {
      autoInitCarousels();
    } catch (error) {
      logger.error('Carousel initialization failed:', error);
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
        logger.error('Failed to load modules:', error);
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
        logger.error('Failed to load modules:', error);
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
  resetAutoInitState();
  destroySmoothScroll();
  cleanupConditionalAnalytics();
  cleanupKeyboardNavigation();

  isInitialized = false;
}

export function reinitOnPageLoad(): void {
  cleanupCoreFeatures();
  setTimeout(() => {
    initCoreFeatures();
  }, 50);
}

