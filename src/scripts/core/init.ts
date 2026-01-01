import { initSmoothScroll, destroySmoothScroll } from '../smoothScroll';
import { init as initScrollAnimations, cleanup as cleanupScrollAnimations, refresh as refreshScrollAnimations } from '../utils/scrollReveal';
import { initScrollProgress, cleanupScrollProgress } from './scrollProgress';
import { initNavigation, cleanupNavigation } from './navigation';
import { initFloatingButton, cleanupFloatingButton } from './floatingButton';
import { initHeroBackground, cleanupHeroBackground } from '../utils/heroBackground';
import { setupParallax, cleanupParallax } from '../sections/services/parallax';
import { initAccordions, cleanupAccordions } from '../utils/accordions';
import { cleanupAllCarousels } from '../utils/carousels';
import { setupGoogleCalendar } from '../widgets/googleCalendar';
import { initThemeToggle } from '../ui/themeToggle';
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

  const runInit = () => {
    initSmoothScroll();
    initScrollAnimations();
    initScrollProgress();
    initNavigation();
    initFloatingButton();
    initAccordions();
    initLazyLoading();
    setTimeout(() => refreshScrollAnimations(), 100);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(runInit, { timeout: 500 });
  } else {
    setTimeout(runInit, 1);
  }
}

export function initPageFeatures(showParticles: boolean = false): void {
  if (showParticles) initHeroBackground();

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
