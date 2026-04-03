import {
  EmblaCarouselWrapper,
  clearEmblaInstances,
  deleteEmblaInstance,
  getEmblaInstance,
  setEmblaInstance,
  type EmblaCarouselOptions,
} from "@/scripts/animations/EmblaCarousel";
import { BREAKPOINTS } from "@/scripts/core/constants";

const REINIT_DEBOUNCE = 150;
const BASE_OPTIONS = {
  autoplay: true,
  pauseOnHover: true,
  align: "center" as const,
  dragFree: false,
  skipSnaps: false,
};

export interface CarouselConfig {
  containerId: string;
  breakpoint: number;
  activateOnDesktop?: boolean;
  carouselOptions?: Partial<EmblaCarouselOptions>;
}

const CAROUSEL_CONFIGS: CarouselConfig[] = [
  {
    containerId: "code-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4000 },
  },
  {
    containerId: "mission-vision-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: {
      ...BASE_OPTIONS,
      autoplayInterval: 5000,
      loop: false,
      containScroll: "keepSnaps",
    },
  },
  {
    containerId: "global-metrics-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 3500 },
  },
  {
    containerId: "capabilities-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4500 },
  },
  {
    containerId: "services-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5000 },
  },
  {
    containerId: "impact-carousel-container",
    breakpoint: 0,
    activateOnDesktop: true,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4000 },
  },
  {
    containerId: "service-process-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5000 },
  },
  {
    containerId: "service-benefits-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4500 },
  },
];

interface CarouselState {
  instance: EmblaCarouselWrapper | null;
  mediaQuery: MediaQueryList | null;
  mediaHandler: (() => void) | null;
  observer: ResizeObserver | null;
  reinitTimer: ReturnType<typeof setTimeout> | null;
  isActive: boolean;
}

function getResponsiveOptions(
  slideCount: number,
): Partial<EmblaCarouselOptions> {
  return slideCount <= 2
    ? {
        align: "center",
        containScroll: "keepSnaps",
        slidesToScroll: 1,
        dragFree: false,
      }
    : {
        align: "center",
        containScroll: false,
        slidesToScroll: 1,
        dragFree: false,
      };
}

function scheduleFrame(callback: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function createCarouselOptions(
  slideCount: number,
  carouselOptions: Partial<EmblaCarouselOptions>,
): EmblaCarouselOptions {
  const responsiveOptions = getResponsiveOptions(slideCount);
  const loop = carouselOptions.loop ?? slideCount > 2;

  return {
    ...BASE_OPTIONS,
    ...responsiveOptions,
    ...carouselOptions,
    loop,
    containScroll: loop
      ? false
      : (carouselOptions.containScroll ?? responsiveOptions.containScroll),
  };
}

function createCarouselManager(config: CarouselConfig) {
  const {
    containerId,
    breakpoint,
    activateOnDesktop = false,
    carouselOptions = {},
  } = config;

  const state: CarouselState = {
    instance: null,
    mediaQuery: null,
    mediaHandler: null,
    observer: null,
    reinitTimer: null,
    isActive: false,
  };

  function getContainer(): HTMLElement | null {
    const container = document.getElementById(containerId);
    return container && document.body.contains(container) ? container : null;
  }

  function shouldActivate(): boolean {
    if (!state.mediaQuery) return true;
    return activateOnDesktop
      ? state.mediaQuery.matches
      : !state.mediaQuery.matches;
  }

  function clearPendingReinit(): void {
    if (!state.reinitTimer) return;
    clearTimeout(state.reinitTimer);
    state.reinitTimer = null;
  }

  function queueReinit(container: HTMLElement): void {
    clearPendingReinit();
    state.reinitTimer = setTimeout(() => {
      if (
        state.instance?.embla &&
        container.offsetWidth > 0 &&
        document.body.contains(container)
      ) {
        state.instance.reInit();
      }
    }, REINIT_DEBOUNCE);
  }

  function destroyInstance(): void {
    clearPendingReinit();
    state.observer?.disconnect();
    state.observer = null;
    state.instance?.destroy();
    state.instance = null;
    state.isActive = false;
    deleteEmblaInstance(containerId);
  }

  function observeContainer(container: HTMLElement): void {
    if (typeof ResizeObserver === "undefined") return;

    state.observer = new ResizeObserver(() => {
      queueReinit(container);
    });
    state.observer.observe(container);
  }

  function createInstance(): void {
    const container = getContainer();
    if (!container) return;

    const slideCount = container.querySelectorAll(".embla__slide").length;
    if (!slideCount) return;

    destroyInstance();

    state.instance = new EmblaCarouselWrapper(
      container,
      createCarouselOptions(slideCount, carouselOptions),
    );

    if (!state.instance.embla) {
      state.instance = null;
      return;
    }

    state.isActive = true;
    setEmblaInstance(containerId, state.instance);
    observeContainer(container);
  }

  function syncInstance(): void {
    if (shouldActivate()) {
      if (!state.isActive) {
        scheduleFrame(createInstance);
      }
      return;
    }

    destroyInstance();
  }

  function init(): void {
    if (breakpoint > 0) {
      state.mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
      state.mediaHandler = syncInstance;
      state.mediaQuery.addEventListener("change", state.mediaHandler);
    }

    scheduleFrame(syncInstance);
  }

  function cleanup(): void {
    destroyInstance();

    if (state.mediaQuery && state.mediaHandler) {
      state.mediaQuery.removeEventListener("change", state.mediaHandler);
      state.mediaHandler = null;
      state.mediaQuery = null;
    }
  }

  return { init, cleanup };
}

const carouselManagers = new Map<
  string,
  ReturnType<typeof createCarouselManager>
>();

export function getCarouselInstance(
  containerId: string,
): EmblaCarouselWrapper | null {
  return getEmblaInstance(containerId);
}

export function initCarousel(config: CarouselConfig): () => void {
  const existing = carouselManagers.get(config.containerId);
  if (existing) {
    existing.cleanup();
  }

  const manager = createCarouselManager(config);
  carouselManagers.set(config.containerId, manager);
  manager.init();

  return manager.cleanup;
}

export function autoInitCarousels(): void {
  if (typeof document === "undefined") return;

  CAROUSEL_CONFIGS.forEach((config) => {
    if (carouselManagers.has(config.containerId)) return;
    if (!document.getElementById(config.containerId)) return;
    initCarousel(config);
  });
}

export function cleanupAllCarousels(): void {
  carouselManagers.forEach((manager) => manager.cleanup());
  carouselManagers.clear();
  clearEmblaInstances();
}
