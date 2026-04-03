import { forceUnlockScroll } from '../navigation/utils';
import { logger } from '@/lib/logger';

let isInitialized = false;
let initRunId = 0;

type CriticalModules = {
  keyboardNavigation: typeof import('../utils/keyboardNavigation');
  navigation: typeof import('../navigation/index');
  scrollAnimations: typeof import('../utils/scrollReveal');
  scrollProgress: typeof import('./scrollProgress');
  smoothScroll: typeof import('./smoothScroll');
  webVitals: typeof import('../utils/webVitals');
};

type DeferredModules = {
  accordions: typeof import('../utils/accordions');
  analytics: typeof import('../analytics/conditionalLoader');
  serviceWorker: typeof import('./serviceWorker');
};

type PageFeatureModules = {
  carousels: typeof import('../utils/carousels');
  heroBackground: typeof import('../utils/heroBackground');
};

type ModuleLoader<T> = {
  getCached: () => T | null;
  load: () => Promise<T>;
};

function createModuleLoader<T>(loader: () => Promise<T>): ModuleLoader<T> {
  let cache: T | null = null;
  let promise: Promise<T> | null = null;

  return {
    getCached: () => cache,
    load: () => {
      if (cache) return Promise.resolve(cache);
      if (!promise) {
        promise = loader().then((modules) => {
          cache = modules;
          return modules;
        });
      }

      return promise;
    },
  };
}

const criticalModules = createModuleLoader<CriticalModules>(async () => {
  const [
    keyboardNavigation,
    navigation,
    scrollAnimations,
    scrollProgress,
    smoothScroll,
    webVitals,
  ] = await Promise.all([
    import('../utils/keyboardNavigation'),
    import('../navigation/index'),
    import('../utils/scrollReveal'),
    import('./scrollProgress'),
    import('./smoothScroll'),
    import('../utils/webVitals'),
  ]);

  return {
    keyboardNavigation,
    navigation,
    scrollAnimations,
    scrollProgress,
    smoothScroll,
    webVitals,
  };
});

const deferredModules = createModuleLoader<DeferredModules>(async () => {
  const [accordions, analytics, serviceWorker] = await Promise.all([
    import('../utils/accordions'),
    import('../analytics/conditionalLoader'),
    import('./serviceWorker'),
  ]);

  return { accordions, analytics, serviceWorker };
});

const pageFeatureModules = createModuleLoader<PageFeatureModules>(async () => {
  const [carousels, heroBackground] = await Promise.all([
    import('../utils/carousels'),
    import('../utils/heroBackground'),
  ]);

  return { carousels, heroBackground };
});

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
  const currentRunId = ++initRunId;

  const runCriticalInit = async () => {
    try {
      const modules = await criticalModules.load();
      if (!isInitialized || currentRunId !== initRunId) return;

      modules.webVitals.initWebVitals();
      modules.keyboardNavigation.initKeyboardNavigation();
      modules.smoothScroll.initSmoothScroll();
      modules.scrollProgress.initScrollProgress();
      modules.navigation.initNavigation();
      modules.scrollAnimations.init();
      initLazyLoading();
    } catch (error) {
      logger.warn('Critical init error:', error);
    }
  };

  const runDeferredInit = async () => {
    try {
      const modules = await deferredModules.load();
      if (!isInitialized || currentRunId !== initRunId) return;

      modules.accordions.initAccordions();
      modules.analytics.initConditionalAnalytics();
      modules.serviceWorker.registerServiceWorker();
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
        const cachedCriticalModules = criticalModules.getCached();
        if (
          !cachedCriticalModules ||
          !isInitialized ||
          currentRunId !== initRunId
        ) {
          return;
        }

        try {
          cachedCriticalModules.scrollAnimations.refresh();
        } catch (error) {
          logger.warn('Scroll animation refresh error:', error);
        }
      }, 50);
    } catch (error) {
      logger.warn('Deferred init error:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        void runCriticalInit();
      },
      { once: true },
    );
  } else {
    requestAnimationFrame(() => {
      void runCriticalInit();
    });
  }

  runWhenIdle(() => {
    void runDeferredInit();
  });
}

export function initPageFeatures(): void {
  const particleCanvas = document.getElementById('particle-canvas');
  const currentRunId = initRunId;

  void pageFeatureModules
    .load()
    .then((modules) => {
      if (!isInitialized || currentRunId !== initRunId) return;

      if (particleCanvas) {
        modules.heroBackground.initHeroBackground();
      }

      try {
        modules.carousels.autoInitCarousels();
      } catch (error) {
        logger.error('Carousel initialization failed:', error);
      }
    })
    .catch((error) => {
      logger.error('Page feature initialization failed:', error);
    });

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
  criticalModules.getCached()?.scrollAnimations.cleanup();
  criticalModules.getCached()?.scrollProgress.cleanupScrollProgress();
  criticalModules.getCached()?.navigation.cleanupNavigation();
  pageFeatureModules.getCached()?.heroBackground.cleanupHeroBackground();
  deferredModules.getCached()?.accordions.cleanupAccordions();
  pageFeatureModules.getCached()?.carousels.cleanupAllCarousels();
  criticalModules.getCached()?.smoothScroll.destroySmoothScroll();
  deferredModules.getCached()?.analytics.cleanupConditionalAnalytics();
  criticalModules.getCached()?.keyboardNavigation.cleanupKeyboardNavigation();

  isInitialized = false;
  initRunId += 1;
}

export function reinitOnPageLoad(): void {
  cleanupCoreFeatures();
  setTimeout(() => {
    initCoreFeatures();
  }, 50);
}


