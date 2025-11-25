import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "../../animations";
import { setupSectionInit } from "./initUtils";

const DEFAULT_INIT_DELAY = 100;
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

    if (!container || dots.length === 0) return;

    cleanup();

    state.instance = new EmblaCarouselWrapper(container, dots, {
      loop: true,
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
  }

  function initWithDelay(): void {
    setTimeout(init, initDelay);
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

