import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

const DEFAULT_AUTOPLAY_INTERVAL = 4000;

export interface EmblaCarouselOptions {
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  pauseOnTouch?: boolean;
  align?: 'start' | 'center' | 'end';
  slidesToScroll?: number;
  dragFree?: boolean;
  duration?: number;
  onSlideChange?: (index: number) => void;
}

export class EmblaCarouselWrapper {
  private _embla: EmblaCarouselType | null = null;
  private autoplay: ReturnType<typeof Autoplay> | null = null;
  private onSlideChangeCallback?: (index: number) => void;

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
      duration = 15,
      onSlideChange,
    } = options;

    this.onSlideChangeCallback = onSlideChange;

    const plugins = [];

    if (autoplay) {
      this.autoplay = Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: false,
        stopOnMouseEnter: pauseOnHover,
        stopOnFocusIn: false,
        playOnInit: true,
        stopOnLastSnap: false,
      });
      plugins.push(this.autoplay);
    }

    this._embla = EmblaCarousel(container, {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: false,
      duration,
      dragThreshold: 5,
      skipSnaps: false,
      watchDrag: true,
      watchResize: true,
      watchSlides: true,
      axis: 'x',
      inViewThreshold: 0,
      startIndex: 0,
      watchFocus: false,
    }, plugins);

    this._embla.on('select', () => {
      this.onSelect();
    });

    this._embla.on('reInit', () => {
      this.onSelect();
    });

    this.onSelect();

    if (autoplay && this.autoplay) {
      this.autoplay.play();
    }
  }

  private onSelect(): void {
    if (!this._embla) return;

    const selectedIndex = this._embla.selectedScrollSnap();
    this.onSlideChangeCallback?.(selectedIndex);
  }

  get embla(): EmblaCarouselType | null {
    return this._embla;
  }

  next(): void {
    this._embla?.scrollNext();
  }

  previous(): void {
    this._embla?.scrollPrev();
  }

  destroy(): void {
    this.autoplay?.stop();
    this.autoplay = null;
    this._embla?.destroy();
    this._embla = null;
  }
}