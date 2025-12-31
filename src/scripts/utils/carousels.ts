import { EmblaCarouselWrapper, type EmblaCarouselOptions } from "@/scripts/animations";
import { observeOnce } from "@/scripts/utils/observers";

const DEFAULT_RESIZE_DEBOUNCE_DELAY = 250;

export interface CarouselConfig {
  containerId: string;
  controlSelector: string;
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
    controlSelector,
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
    const control = document.querySelector(controlSelector) as HTMLButtonElement;

    if (!container || !control) {
      if (import.meta.env.DEV) {
        console.warn('Carousel element not found:', !container ? containerId : controlSelector);
      }
      return;
    }

    const computedStyle = window.getComputedStyle(container);
    const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0';
    const hasSlides = container.querySelectorAll('.embla__slide').length > 0;

    if (!hasSlides || container.offsetParent === null || isHidden) {
      const retryDelay = window.innerWidth < 768 ? 150 : 50;

      setTimeout(() => {
        const updatedStyle = window.getComputedStyle(container);
        const stillHidden = updatedStyle.display === 'none' || updatedStyle.visibility === 'hidden' || updatedStyle.opacity === '0';
        const nowHasSlides = container.querySelectorAll('.embla__slide').length > 0;

        if (!stillHidden && container.offsetParent !== null && nowHasSlides) {
          init();
        } else {
          observeOnce(container, init, { threshold: 0 });
        }
      }, retryDelay);
      return;
    }

    cleanup();

    state.instance = new EmblaCarouselWrapper(container, null, {
      loop: false,
      autoplay: true,
      align: "center",
      slidesToScroll: 1,
      dragFree: false,
      ...carouselOptions,
    });

    // Setup pause/play control
    if (control && state.instance) {
      const updateControlState = (isPlaying: boolean) => {
        control.setAttribute('data-playing', isPlaying.toString());
        control.setAttribute('aria-label', isPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay');

        const icon = control.querySelector('svg');
        if (icon) {
          icon.innerHTML = isPlaying
            ? '<path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"/>' // Pause icon
            : '<path d="M8 5v14l11-7z"/>'; // Play icon
        }
      };

      control.addEventListener('click', () => {
        const isPlaying = control.getAttribute('data-playing') === 'true';
        if (isPlaying) {
          state.instance?.pause();
          updateControlState(false);
        } else {
          state.instance?.play();
          updateControlState(true);
        }
      });

      // Initialize control state
      updateControlState(true);

      // Pause on hover for better UX
      container.addEventListener('mouseenter', () => {
        if (control.getAttribute('data-playing') === 'true') {
          state.instance?.pause();
        }
      });

      container.addEventListener('mouseleave', () => {
        if (control.getAttribute('data-playing') === 'true') {
          state.instance?.play();
        }
      });
    }

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

