import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

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

    this._embla.on('select', this.handleSelect);
    this._embla.on('reInit', this.handleSelect);

    this.handleSelect();

    if (autoplay && this.autoplayPlugin) {
      requestAnimationFrame(() => {
        if (!this.isDestroyed && this.autoplayPlugin) {
          this.autoplayPlugin.play();
        }
      });
    }
  }

  private handleSelect = (): void => {
    if (!this._embla || this.isDestroyed) return;
    const selectedIndex = this._embla.selectedScrollSnap();
    this.onSlideChangeCallback?.(selectedIndex);
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
