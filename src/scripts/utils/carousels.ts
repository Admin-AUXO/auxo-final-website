import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "@/scripts/animations";
import { observeOnce } from "@/scripts/utils/observers";

const DEFAULT_RESIZE_DEBOUNCE_DELAY = 250;

export interface CarouselConfig {
  containerId: string;
  dotSelector: string;
  breakpoint: number;
  activateOnDesktop?: boolean;
  resizeDebounceDelay?: number;
  carouselOptions?: Partial<EmblaCarouselOptions>;
}

interface CarouselState {
  instance: EmblaCarouselWrapper | null;
  resizeHandler: (() => void) | null;
  resizeTimeout: NodeJS.Timeout | null;
  observer: ResizeObserver | null;
}

function shouldActivateCarousel(activateOnDesktop: boolean, breakpoint: number): boolean {
  const width = window.innerWidth || document.documentElement.clientWidth;
  return activateOnDesktop ? width >= breakpoint : width < breakpoint;
}

function createCarouselManager(config: CarouselConfig) {
  const {
    containerId,
    dotSelector,
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
    const dots = document.querySelectorAll(dotSelector);

    if (!container || dots.length === 0) {
      if (import.meta.env.DEV) {
        console.warn('Carousel element not found:', !container ? containerId : dotSelector);
      }
      return;
    }

    const computedStyle = window.getComputedStyle(container);
    const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0';
    const hasSlides = dots.length > 0;

    if (!hasSlides || container.offsetParent === null || isHidden) {
      const retryDelay = window.innerWidth < 768 ? 150 : 50;

      setTimeout(() => {
        const updatedStyle = window.getComputedStyle(container);
        const stillHidden = updatedStyle.display === 'none' || updatedStyle.visibility === 'hidden' || updatedStyle.opacity === '0';
        const nowHasSlides = document.querySelectorAll(dotSelector).length > 0;

        if (!stillHidden && container.offsetParent !== null && nowHasSlides) {
          init();
        } else {
          observeOnce(container, init, { threshold: 0 });
        }
      }, retryDelay);
      return;
    }

    cleanup();

    state.instance = new EmblaCarouselWrapper(container, dots, {
      loop: false,
      autoplay: false,
      align: "center",
      slidesToScroll: 1,
      dragFree: false,
      ...carouselOptions,
    });

    state.resizeHandler = () => {
      if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(init, resizeDebounceDelay);
    };

    window.addEventListener("resize", state.resizeHandler);

    if (typeof ResizeObserver !== 'undefined') {
      state.observer = new ResizeObserver(() => {
        if (state.instance?.embla && container.offsetParent !== null) {
          state.instance.embla.reInit();
        }
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

