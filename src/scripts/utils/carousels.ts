import {
  EmblaCarouselWrapper,
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
const initializedContainers = new Set<string>();

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
    containerId: "models-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5500 },
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
  mediaHandler: ((e: MediaQueryListEvent) => void) | null;
  observer: ResizeObserver | null;
  reinitTimer: ReturnType<typeof setTimeout> | null;
  isActive: boolean;
}

function getResponsiveOptions(slideCount: number): Partial<EmblaCarouselOptions> {
  if (slideCount <= 2) {
    return {
      align: 'center',
      containScroll: 'keepSnaps',
      slidesToScroll: 1,
      dragFree: false,
    };
  }

  return {
    align: 'center',
    containScroll: false,
    slidesToScroll: 1,
    dragFree: false,
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

  function shouldActivate(): boolean {
    if (breakpoint === 0 && activateOnDesktop) return true;
    if (!state.mediaQuery) return false;
    return activateOnDesktop ? state.mediaQuery.matches : !state.mediaQuery.matches;
  }

  function destroyInstance(): void {
    if (state.reinitTimer) {
      clearTimeout(state.reinitTimer);
      state.reinitTimer = null;
    }

    state.observer?.disconnect();
    state.observer = null;

    state.instance?.destroy();
    state.instance = null;
    state.isActive = false;

    if (window.emblaInstances) {
      window.emblaInstances.delete(containerId);
    }
  }

  function createInstance(): void {
    const container = document.getElementById(containerId);
    if (!container || !document.body.contains(container)) return;

    const slides = container.querySelectorAll('.embla__slide');
    if (slides.length === 0) return;

    destroyInstance();

    const slideCount = slides.length;
    const shouldLoop = slideCount > 2;
    const responsiveOptions = getResponsiveOptions(slideCount);

    const mergedOptions: EmblaCarouselOptions = {
      loop: shouldLoop,
      autoplay: true,
      pauseOnHover: true,
      ...responsiveOptions,
      ...carouselOptions,
      containScroll: shouldLoop ? false : (carouselOptions.containScroll ?? responsiveOptions.containScroll),
    };

    try {
      state.instance = new EmblaCarouselWrapper(container, mergedOptions);
      state.isActive = true;

      if (!window.emblaInstances) {
        window.emblaInstances = new Map();
      }
      window.emblaInstances.set(containerId, state.instance);
    } catch {
      state.isActive = false;
      return;
    }


    if (typeof ResizeObserver !== 'undefined') {
      state.observer = new ResizeObserver(() => {
        if (state.reinitTimer) clearTimeout(state.reinitTimer);
        state.reinitTimer = setTimeout(() => {
          if (state.instance?.embla && container.offsetWidth > 0 && document.body.contains(container)) {
            state.instance.reInit();
          }
        }, REINIT_DEBOUNCE);
      });
      state.observer.observe(container);
    }
  }

  function handleBreakpointChange(): void {
    if (shouldActivate()) {
      if (!state.isActive) {

        requestAnimationFrame(() => requestAnimationFrame(createInstance));
      }
    } else {
      destroyInstance();
    }
  }

  function init(): void {

    if (breakpoint > 0) {
      const query = `(min-width: ${breakpoint}px)`;
      state.mediaQuery = window.matchMedia(query);

      state.mediaHandler = () => handleBreakpointChange();
      state.mediaQuery.addEventListener('change', state.mediaHandler);
    }


    requestAnimationFrame(() => requestAnimationFrame(handleBreakpointChange));
  }

  function cleanup(): void {
    destroyInstance();

    if (state.mediaQuery && state.mediaHandler) {
      state.mediaQuery.removeEventListener('change', state.mediaHandler);
      state.mediaHandler = null;
      state.mediaQuery = null;
    }
  }

  return { init, cleanup };
}

const carouselManagers = new Map<string, ReturnType<typeof createCarouselManager>>();

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
    if (initializedContainers.has(config.containerId)) return;

    const container = document.getElementById(config.containerId);
    if (!container) return;

    initializedContainers.add(config.containerId);
    initCarousel(config);
  });
}

export function cleanupAllCarousels(): void {
  carouselManagers.forEach((manager) => manager.cleanup());
  carouselManagers.clear();

  if (window.emblaInstances) {
    window.emblaInstances.clear();
  }
}

export function resetAutoInitState(): void {
  initializedContainers.clear();
}

