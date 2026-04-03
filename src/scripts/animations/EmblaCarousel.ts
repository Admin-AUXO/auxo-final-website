import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { logger } from '@/lib/logger';

const DEFAULT_AUTOPLAY_INTERVAL = 4000;
const DEFAULT_DURATION = 25;
const emblaInstances = new Map<string, EmblaCarouselWrapper>();

export interface EmblaCarouselOptions {
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  align?: 'start' | 'center' | 'end';
  slidesToScroll?: number | 'auto';
  dragFree?: boolean;
  duration?: number;
  containScroll?: 'trimSnaps' | 'keepSnaps' | false;
  skipSnaps?: boolean;
  onSlideChange?: (index: number) => void;
}

export class EmblaCarouselWrapper {
  private _embla: EmblaCarouselType | null = null;
  private autoplayPlugin: ReturnType<typeof Autoplay> | null = null;
  private onSlideChangeCallback?: (index: number) => void;
  private isDestroyed = false;

  constructor(
    private container: HTMLElement,
    options: EmblaCarouselOptions = {},
  ) {
    const {
      loop = true,
      autoplay = true,
      autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
      pauseOnHover = true,
      align = 'center',
      slidesToScroll = 1,
      dragFree = false,
      duration = DEFAULT_DURATION,
      containScroll = 'trimSnaps',
      skipSnaps = false,
      onSlideChange,
    } = options;

    this.onSlideChangeCallback = onSlideChange;

    const plugins = autoplay
      ? [
          (this.autoplayPlugin = Autoplay({
            delay: autoplayInterval,
            stopOnInteraction: false,
            stopOnMouseEnter: pauseOnHover,
            stopOnFocusIn: false,
            playOnInit: true,
            stopOnLastSnap: !loop,
          })),
        ]
      : [];

    const emblaOptions: EmblaOptionsType = {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: loop ? false : containScroll,
      duration,
      dragThreshold: 10,
      skipSnaps,
      watchDrag: true,
      watchResize: true,
      watchSlides: true,
      axis: 'x',
      inViewThreshold: 0.7,
      startIndex: 0,
      watchFocus: false,
    };

    try {
      this._embla = EmblaCarousel(this.container, emblaOptions, plugins);
    } catch (error) {
      logger.warn('Failed to initialize Embla Carousel:', error);
      this.isDestroyed = true;
      return;
    }

    if (!this._embla) {
      this.isDestroyed = true;
      return;
    }

    this._embla.on('select', this.handleSelect);
    this._embla.on('reInit', this.handleSelect);
    this.handleSelect();
  }

  private handleSelect = (): void => {
    if (!this._embla || this.isDestroyed) return;
    this.onSlideChangeCallback?.(this._embla.selectedScrollSnap());
  };

  get embla(): EmblaCarouselType | null {
    return this._embla;
  }

  get selectedIndex(): number {
    return this._embla?.selectedScrollSnap() ?? 0;
  }

  next(): void {
    if (!this.isDestroyed) {
      this._embla?.scrollNext();
    }
  }

  previous(): void {
    if (!this.isDestroyed) {
      this._embla?.scrollPrev();
    }
  }

  scrollTo(index: number, jump = false): void {
    if (!this.isDestroyed) {
      this._embla?.scrollTo(index, jump);
    }
  }

  reInit(): void {
    if (!this.isDestroyed && this._embla) {
      this._embla.reInit();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.autoplayPlugin) {
      try {
        this.autoplayPlugin.stop();
      } catch {
        // Ignore plugin teardown failures.
      }
      this.autoplayPlugin = null;
    }

    if (this._embla) {
      this._embla.off('select', this.handleSelect);
      this._embla.off('reInit', this.handleSelect);
      this._embla.destroy();
      this._embla = null;
    }
  }
}

export function getEmblaInstance(
  containerId: string,
): EmblaCarouselWrapper | null {
  return emblaInstances.get(containerId) ?? null;
}

export function setEmblaInstance(
  containerId: string,
  instance: EmblaCarouselWrapper,
): void {
  emblaInstances.set(containerId, instance);
}

export function deleteEmblaInstance(containerId: string): void {
  emblaInstances.delete(containerId);
}

export function clearEmblaInstances(): void {
  emblaInstances.clear();
}
