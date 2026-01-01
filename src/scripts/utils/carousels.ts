import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "@/scripts/animations";
import { observeOnce } from "@/scripts/utils/observers";

const DEFAULT_RESIZE_DEBOUNCE_DELAY = 250;

export interface CarouselConfig {
  containerId: string;
  breakpoint: number;
  activateOnDesktop?: boolean;
  resizeDebounceDelay?: number;
  carouselOptions?: Partial<EmblaCarouselOptions>;
}

interface CarouselState {
  instance: EmblaCarouselWrapper | null;
  resizeHandler: (() => void) | null;
  resizeTimeout: ReturnType<typeof setTimeout> | null;
  observer: ResizeObserver | null;
}

function shouldActivateCarousel(activateOnDesktop: boolean, breakpoint: number): boolean {
  const width = window.innerWidth || document.documentElement.clientWidth;
  return activateOnDesktop ? width >= breakpoint : width < breakpoint;
}

function createCarouselManager(config: CarouselConfig) {
  const {
    containerId,
    breakpoint,
    resizeDebounceDelay = DEFAULT_RESIZE_DEBOUNCE_DELAY,
    activateOnDesktop = false,
    carouselOptions = {},
  } = config;

  const state: CarouselState = {
    instance: null,
    resizeHandler: null,
    resizeTimeout: null,
    observer: null,
  };

  function cleanup(): void {
    state.instance?.destroy();
    state.instance = null;
    if (state.resizeHandler) {
      window.removeEventListener("resize", state.resizeHandler);
      state.resizeHandler = null;
    }
    if (state.resizeTimeout) {
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = null;
    }
    state.observer?.disconnect();
    state.observer = null;
  }

  function init(): void {
    if (!shouldActivateCarousel(activateOnDesktop, breakpoint)) {
      cleanup();
      return;
    }

    const container = document.getElementById(containerId);

    if (!container) {
      if (import.meta.env.DEV) {
        console.warn('Carousel element not found:', containerId);
      }
      return;
    }

    const hasSlides = container.querySelectorAll('.embla__slide').length > 0;

    if (!hasSlides) {
      if (import.meta.env.DEV) {
        console.warn(`Carousel ${containerId} not ready: no slides found`);
      }

      setTimeout(() => {
        const retryHasSlides = container.querySelectorAll('.embla__slide').length > 0;
        if (retryHasSlides) {
          init();
        } else {
          observeOnce(container, init, { threshold: 0.01 });
        }
      }, 100);

      return;
    }

    if (!document.body.contains(container)) {
      if (import.meta.env.DEV) {
        console.warn(`Carousel container ${containerId} was removed from DOM`);
      }
      return;
    }

    cleanup();

    try {
      state.instance = new EmblaCarouselWrapper(container, {
        loop: true,
        autoplay: true,
        align: "center",
        slidesToScroll: 1,
        dragFree: false,
        ...carouselOptions,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to initialize carousel ${containerId}:`, error);
      }
      return;
    }

    state.resizeHandler = () => {
      if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(init, resizeDebounceDelay);
    };

    window.addEventListener("resize", state.resizeHandler);

    if (typeof ResizeObserver !== 'undefined') {
      state.observer = new ResizeObserver(() => {
        if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
        state.resizeTimeout = setTimeout(() => {
          if (state.instance?.embla && container.offsetWidth > 0 && document.body.contains(container)) {
            try {
              state.instance.embla.reInit();
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error(`Failed to reinit carousel ${containerId}:`, error);
              }
            }
          }
        }, 100);
      });
      state.observer.observe(container);
    }
  }

  function initWithDelay(): void {
    requestAnimationFrame(() => requestAnimationFrame(init));
  }

  return { init: initWithDelay, cleanup };
}

const carouselManagers = new Map<string, ReturnType<typeof createCarouselManager>>();

// Global autoplay manager - ensures all carousels maintain autoplay
class CarouselAutoplayManager {
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private isActive = false;

  start(): void {
    if (this.isActive) return;
    this.isActive = true;

    // Check every 3 seconds to ensure autoplay is running
    this.checkInterval = setInterval(() => {
      carouselManagers.forEach((manager, containerId) => {
        try {
          const container = document.getElementById(containerId);
          if (container && !document.hidden) { // Only when page is visible
            // Force re-initialization if needed
            manager.cleanup();
            manager.init();
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(`Failed to maintain carousel autoplay for ${containerId}:`, error);
          }
        }
      });
    }, 3000);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, ensure autoplay restarts
        setTimeout(() => {
          carouselManagers.forEach((manager) => {
            manager.cleanup();
            manager.init();
          });
        }, 100);
      }
    });
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isActive = false;
  }
}

const autoplayManager = new CarouselAutoplayManager();

export function initCarousel(config: CarouselConfig): () => void {
  const manager = createCarouselManager(config);
  carouselManagers.set(config.containerId, manager);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", manager.cleanup);
  }

  // Start global autoplay management when first carousel is initialized
  if (carouselManagers.size === 1) {
    autoplayManager.start();
  }

  return manager.cleanup;
}

export function cleanupAllCarousels(): void {
  carouselManagers.forEach((manager) => manager.cleanup());
  carouselManagers.clear();
  autoplayManager.stop();
}

export function reinitCarousels(): void {
  carouselManagers.forEach((manager) => {
    manager.cleanup();
    manager.init();
  });
}

