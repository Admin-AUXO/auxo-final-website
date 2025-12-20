import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "../../animations";
import { setupSectionInit } from "./initUtils";
import { observeOnce } from "../../utils/observers";

const DEFAULT_INIT_DELAY = 0;
const DEFAULT_RESIZE_DEBOUNCE_DELAY = 250;

export interface CarouselConfig {
  containerId: string;
  dotSelector: string;
  breakpoint: number;
  initDelay?: number;
  resizeDebounceDelay?: number;
  activateOnDesktop?: boolean;
  carouselOptions?: Partial<EmblaCarouselOptions>;
}

interface CarouselState {
  instance: EmblaCarouselWrapper | null;
  resizeHandler: (() => void) | null;
  resizeTimeout: NodeJS.Timeout | null;
  observer: ResizeObserver | null;
}

function createCarouselManager(config: CarouselConfig) {
  const {
    containerId,
    dotSelector,
    breakpoint,
    initDelay = DEFAULT_INIT_DELAY,
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
    if (state.instance) {
      state.instance.destroy();
      state.instance = null;
    }
    if (state.resizeHandler) {
      window.removeEventListener("resize", state.resizeHandler);
      state.resizeHandler = null;
    }
    if (state.resizeTimeout) {
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = null;
    }
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
  }

  function init(): void {
    const shouldActivate = activateOnDesktop
      ? window.innerWidth >= breakpoint
      : window.innerWidth < breakpoint;

    if (!shouldActivate) {
      cleanup();
      return;
    }

    const container = document.getElementById(containerId) as HTMLElement;
    const dots = document.querySelectorAll(dotSelector);

    if (!container) {
      console.warn(`Carousel container not found: ${containerId}`);
      return;
    }

    if (dots.length === 0) {
      console.warn(`Carousel dots not found: ${dotSelector}`);
      return;
    }

    const isVisible = container.offsetParent !== null;
    if (!isVisible) {
      observeOnce(container, () => {
        init();
      }, { threshold: 0 });
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
      if (state.resizeTimeout) {
        clearTimeout(state.resizeTimeout);
      }
      state.resizeTimeout = setTimeout(() => {
        init();
      }, resizeDebounceDelay);
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
    const attemptInit = () => {
      if (initDelay <= 0) {
        requestAnimationFrame(() => requestAnimationFrame(init));
      } else {
        setTimeout(init, initDelay);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptInit, { once: true });
    } else {
      attemptInit();
    }
  }

  return {
    init,
    initWithDelay,
    cleanup,
  };
}

export function setupCarouselSection(config: CarouselConfig) {
  const carouselManager = createCarouselManager(config);
  
  if (typeof window !== "undefined") {
    setupSectionInit(
      () => carouselManager.initWithDelay(),
      () => carouselManager.cleanup()
    );
    window.addEventListener("beforeunload", () => carouselManager.cleanup());
  }
  
  return carouselManager;
}
