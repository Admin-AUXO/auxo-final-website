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

    if (!container) return;

    const hasSlides = container.querySelectorAll('.embla__slide').length > 0;

    if (!hasSlides) {
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

    if (!document.body.contains(container)) return;

    cleanup();

    const isMobile = window.innerWidth < 768;
    const mobileOptions = isMobile ? {
      slidesToScroll: 1,
      duration: 12,
    } : {
      slidesToScroll: 1,
      duration: 15,
    };

    try {
      state.instance = new EmblaCarouselWrapper(container, {
        loop: true,
        autoplay: true,
        align: "center",
        dragFree: true,
        ...mobileOptions,
        ...carouselOptions,
      });
    } catch (error) {
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
            } catch (error) {}
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

export function initCarousel(config: CarouselConfig): () => void {
  const manager = createCarouselManager(config);
  carouselManagers.set(config.containerId, manager);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", manager.cleanup);
  }

  return manager.cleanup;
}

export function cleanupAllCarousels(): void {
  carouselManagers.forEach((manager) => manager.cleanup());
  carouselManagers.clear();
}

export function reinitCarousels(): void {
  carouselManagers.forEach((manager) => {
    manager.cleanup();
    manager.init();
  });
}

