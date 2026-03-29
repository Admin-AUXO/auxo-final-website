import { initSmoothScroll, destroySmoothScroll } from './smoothScroll';
import { init as initScrollAnimations, cleanup as cleanupScrollAnimations, refresh as refreshScrollAnimations } from '../utils/scrollReveal';
import { initScrollProgress, cleanupScrollProgress } from './scrollProgress';
import { initNavigation, cleanupNavigation } from '../navigation/index';
import { initHeroBackground, cleanupHeroBackground } from '../utils/heroBackground';
import { initAccordions, cleanupAccordions } from '../utils/accordions';
import { autoInitCarousels, cleanupAllCarousels, resetAutoInitState } from '../utils/carousels';
import { forceUnlockScroll } from '../navigation/utils';
import { initWebVitals } from '../utils/webVitals';
import { initConditionalAnalytics, cleanupConditionalAnalytics } from '../analytics/conditionalLoader';
import { initKeyboardNavigation, cleanupKeyboardNavigation } from '../utils/keyboardNavigation';
import { registerServiceWorker } from './serviceWorker';
import { logger } from '@/lib/logger';

let isInitialized = false;

function runWhenIdle(callback: () => void, timeout: number = 1000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => callback(), { timeout });
    return;
  }

  setTimeout(callback, 100);
}

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
      initAccordions();
      initConditionalAnalytics();
      registerServiceWorker();
      if (
        document.querySelector('[data-consent-banner], [data-consent-modal]')
      ) {
        void import('../common/cookieConsent')
          .then((cookieConsent) => {
            cookieConsent.initCookieConsent();
          })
          .catch((error) => {
            logger.warn('Cookie consent deferred init error:', error);
          });
      }

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

  runWhenIdle(runDeferredInit);
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

  runWhenIdle(() => {
    const loaders: Promise<void>[] = [];
    const calendarWidgetsEnabled =
      document.body?.dataset.enableCalendarWidgets === 'true';

    if (
      calendarWidgetsEnabled &&
      document.querySelector('[data-google-calendar-open]')
    ) {
      loaders.push(
        import('../widgets/googleCalendar').then((calendar) => {
          calendar.setupGoogleCalendar();
        }),
      );
    }

    if (
      document.getElementById('theme-toggle-desktop') ||
      document.getElementById('theme-toggle-mobile')
    ) {
      loaders.push(
        import('../ui/themeToggle').then((theme) => {
          theme.initThemeToggle();
        }),
      );
    }

    if (!loaders.length) return;

    Promise.all(loaders).catch((error) => {
      logger.error('Failed to load deferred modules:', error);
    });
  });
}

export function cleanupCoreFeatures(): void {
  forceUnlockScroll();
  cleanupScrollAnimations();
  cleanupScrollProgress();
  cleanupNavigation();
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


