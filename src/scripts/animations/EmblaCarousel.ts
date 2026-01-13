import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { logger } from '@/lib/logger';

const DEFAULT_AUTOPLAY_INTERVAL = 4000;
const DEFAULT_DURATION = 25;

export interface EmblaCarouselOptions {
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  pauseOnTouch?: boolean;
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
    private options: EmblaCarouselOptions = {}
  ) {
    const {
      loop = true,
      autoplay = true,
      autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
      pauseOnHover = false,
      align = 'center',
      slidesToScroll = 1,
      dragFree = false,
      duration = DEFAULT_DURATION,
      containScroll = 'trimSnaps',
      skipSnaps = false,
      onSlideChange,
    } = options;

    this.onSlideChangeCallback = onSlideChange;

    const plugins: ReturnType<typeof Autoplay>[] = [];

    if (autoplay) {
      this.autoplayPlugin = Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: false,
        stopOnMouseEnter: pauseOnHover,
        stopOnFocusIn: false,
        playOnInit: true,
        stopOnLastSnap: false,
      });
      plugins.push(this.autoplayPlugin);
    }

    const emblaOptions: EmblaOptionsType = {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll,
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

    this._embla = EmblaCarousel(container, emblaOptions, plugins);

    if (!this._embla) {
      this.isDestroyed = true;
      return;
    }

    this._embla.on('select', this.handleSelect);
    this._embla.on('reInit', this.handleSelect);
    this._embla.on('settle', this.ensureSlideVisibility);

    this.handleSelect();
    this.ensureSlideVisibility();

    requestAnimationFrame(() => {
      if (!this.isDestroyed && this._embla) {
        this._embla.reInit();
        this.ensureSlideVisibility();
        this._embla.scrollTo(0);
      }
    });

    if (autoplay && this.autoplayPlugin && this._embla) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!this.isDestroyed && this.autoplayPlugin && this._embla && this._embla.scrollSnapList && this._embla.scrollSnapList().length > 0) {
            try {
              this._embla.scrollTo(0);
              this.autoplayPlugin.play();
            } catch (error) {
              logger.warn('Failed to start carousel autoplay:', error);
            }
          }
        });
      });
    }
  }

  private handleSelect = (): void => {
    if (!this._embla || this.isDestroyed) return;
    const selectedIndex = this._embla.selectedScrollSnap();
    this.onSlideChangeCallback?.(selectedIndex);
    this.ensureSlideVisibility();
  };

  private ensureSlideVisibility = (): void => {
    if (!this._embla || this.isDestroyed) return;
    const slides = this.container.querySelectorAll('.embla__slide');
    slides.forEach((slide) => {
      const element = slide as HTMLElement;
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.display = 'block';
      if (element.style.width === '0px' || element.style.width === '0') {
        element.style.width = '';
        element.style.minWidth = '';
      }
    });
  };

  get embla(): EmblaCarouselType | null {
    return this._embla;
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

  scrollTo(index: number): void {
    if (!this.isDestroyed) {
      this._embla?.scrollTo(index);
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
      this.autoplayPlugin.stop();
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
