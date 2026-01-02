import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "@/scripts/animations";

const DEFAULT_RESIZE_DEBOUNCE_DELAY = 200;
const INIT_RETRY_DELAY = 50;

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
  isInitializing: boolean;
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
    isInitializing: false,
  };

  function cleanup(): void {
    state.instance?.destroy();
    state.instance = null;
    state.isInitializing = false;

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
    if (state.isInitializing) return;

    if (!shouldActivateCarousel(activateOnDesktop, breakpoint)) {
      cleanup();
      return;
    }

    const container = document.getElementById(containerId);
    if (!container || !document.body.contains(container)) return;

    const slides = container.querySelectorAll('.embla__slide');
    if (slides.length === 0) {
      setTimeout(init, INIT_RETRY_DELAY);
      return;
    }

    cleanup();
    state.isInitializing = true;

    const slideCount = slides.length;
    const isMobile = window.innerWidth < 768;

    const baseOptions: EmblaCarouselOptions = {
      loop: true,
      autoplay: true,
      align: 'center',
      containScroll: false,
      dragFree: false,
      slidesToScroll: 1,
      duration: isMobile ? 15 : 20,
      ...carouselOptions,
    };

    if (slideCount <= 2) {
      baseOptions.align = 'start';
      baseOptions.containScroll = 'keepSnaps';
    }

    try {
      state.instance = new EmblaCarouselWrapper(container, baseOptions);
      state.isInitializing = false;

      if (!(window as any).emblaInstances) {
        (window as any).emblaInstances = new Map();
      }
      (window as any).emblaInstances.set(containerId, state.instance);
    } catch {
      state.isInitializing = false;
      return;
    }

    state.resizeHandler = () => {
      if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(init, resizeDebounceDelay);
    };

    window.addEventListener("resize", state.resizeHandler, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      state.observer = new ResizeObserver(() => {
        if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
        state.resizeTimeout = setTimeout(() => {
          if (state.instance?.embla && container.offsetWidth > 0 && document.body.contains(container)) {
            state.instance.reInit();
          }
        }, 50);
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
  const existing = carouselManagers.get(config.containerId);
  if (existing) {
    existing.cleanup();
  }

  const manager = createCarouselManager(config);
  carouselManagers.set(config.containerId, manager);
  manager.init();

  return manager.cleanup;
}

export function cleanupAllCarousels(): void {
  carouselManagers.forEach((manager) => manager.cleanup());
  carouselManagers.clear();

  if ((window as any).emblaInstances) {
    (window as any).emblaInstances.clear();
  }
}

export function reinitCarousels(): void {
  carouselManagers.forEach((manager) => {
    manager.cleanup();
    manager.init();
  });
}

export function getCarouselInstance(containerId: string): EmblaCarouselWrapper | null {
  return (window as any).emblaInstances?.get(containerId) ?? null;
}
