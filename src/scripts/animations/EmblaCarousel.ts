import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

const DEFAULT_AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 200;
const TRANSITION_CLEAR_BUFFER = 20;
const CAROUSEL_TRACK_SELECTOR = '.carousel-track, .embla__container';
const DRAGGING_CLASS = 'is-dragging';
const NAVIGATING_CLASS = 'carousel-navigating';
const TRANSITION_CLASS = 'carousel-transition';
const DOT_HIDDEN_CLASS = 'carousel-dot-hidden';
const ACTIVE_CLASS = 'active';

export interface EmblaCarouselOptions {
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  align?: 'start' | 'center' | 'end';
  slidesToScroll?: number;
  dragFree?: boolean;
  onSlideChange?: (index: number) => void;
}

export class EmblaCarouselWrapper {
  private _embla: EmblaCarouselType | null = null;
  private autoplay: ReturnType<typeof Autoplay> | null = null;
  private dots: NodeListOf<Element> | null = null;
  private onSlideChangeCallback?: (index: number) => void;
  private dotClickHandlers: Map<number, () => void> = new Map();
  private isDragging = false;

  constructor(
    private container: HTMLElement,
    dots: NodeListOf<Element> | null = null,
    private options: EmblaCarouselOptions = {}
  ) {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const {
      loop = false,
      autoplay = false,
      autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
      align = 'center',
      slidesToScroll = 1,
      dragFree = false,
      onSlideChange,
    } = options;

    this.dots = dots;
    this.onSlideChangeCallback = onSlideChange;

    const plugins = [];

    if (autoplay) {
      this.autoplay = Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: false,
      });
      plugins.push(this.autoplay);
    }

    this._embla = EmblaCarousel(container, {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: 'trimSnaps',
      duration: isMobile ? 15 : 20,
      dragThreshold: isMobile ? 10 : 5,
      skipSnaps: false,
      watchDrag: true,
      watchResize: true,
      watchSlides: true,
      axis: 'x',
    }, plugins);

    if (this.dots && this.dots.length !== 0) {
      this.setupDots();
    }

    this._embla.on('select', () => {
      this.onSelect();
    });

    this._embla.on('reInit', () => {
      this.onSelect();
    });

    this._embla.on('pointerDown', () => {
      this.isDragging = true;
      this.container.classList.add(DRAGGING_CLASS);
      this.container.classList.remove(NAVIGATING_CLASS);
    });

    this._embla.on('pointerUp', () => {
      this.isDragging = false;
      this.container.classList.remove(DRAGGING_CLASS);
    });

    this._embla.on('settle', () => {
      if (!this.isDragging) {
        this.container.classList.remove(DRAGGING_CLASS);
        this.container.classList.remove(NAVIGATING_CLASS);
      }
    });

    if (this._embla && this._embla.selectedScrollSnap() !== 0) {
      requestAnimationFrame(() => {
        this._embla?.scrollTo(0);
        this.onSelect();
      });
    } else {
      this.onSelect();
    }
  }

  private onSelect(): void {
    if (!this._embla) return;
    
    const selectedIndex = this._embla.selectedScrollSnap();
    this.updateDots(selectedIndex);
    this.onSlideChangeCallback?.(selectedIndex);
  }

  private setupDots(): void {
    if (!this.dots || !this._embla) return;

    const scrollSnaps = this._embla.scrollSnapList();

    this.dots.forEach((dot, index) => {
      if (index >= scrollSnaps.length) return;

      const dotElement = dot as HTMLElement;
      const clickHandler = () => {
        if (this.embla) {
          this.setTransition(true);
          this.container.classList.add(NAVIGATING_CLASS);
          this.embla.scrollTo(index);
          setTimeout(() => {
            this.setTransition(false);
            this.container.classList.remove(NAVIGATING_CLASS);
          }, TRANSITION_DURATION + TRANSITION_CLEAR_BUFFER);
        }
      };

      this.dotClickHandlers.set(index, clickHandler);
      dotElement.addEventListener('click', clickHandler);
    });
  }

  private getTrack(): HTMLElement | null {
    return this.container.querySelector(CAROUSEL_TRACK_SELECTOR) as HTMLElement | null;
  }

  private setTransition(addClass = true): void {
    const track = this.getTrack();
    if (addClass) {
      track?.classList.add(TRANSITION_CLASS);
    } else if (!this.isDragging) {
      track?.classList.remove(TRANSITION_CLASS);
    }
  }

  private updateDots(selectedIndex: number): void {
    if (!this.dots || !this._embla) return;

    const scrollSnaps = this._embla.scrollSnapList();
    const validIndex = Math.min(selectedIndex, scrollSnaps.length - 1);

    this.dots.forEach((dot, index) => {
      const dotElement = dot as HTMLElement;
      const isActive = index === validIndex;
      
      if (index >= scrollSnaps.length) {
        dotElement.classList.add(DOT_HIDDEN_CLASS);
        return;
      }
      
      dotElement.classList.remove(DOT_HIDDEN_CLASS);
      dotElement.classList.toggle(ACTIVE_CLASS, isActive);
      dotElement.setAttribute('aria-current', isActive ? 'true' : 'false');
      dotElement.setAttribute('aria-selected', isActive ? 'true' : 'false');
      dotElement.setAttribute('tabindex', isActive ? '0' : '-1');
      if (!isActive) {
        dotElement.removeAttribute('aria-current');
      }
    });
  }

  get embla(): EmblaCarouselType | null {
    return this._embla;
  }

  goToSlide(index: number): void {
    if (!this._embla) return;
    this.setTransition(true);
    this._embla.scrollTo(index);
    setTimeout(() => this.setTransition(false), TRANSITION_DURATION + TRANSITION_CLEAR_BUFFER);
  }

  next(): void {
    if (!this._embla) return;
    this.setTransition(true);
    this._embla.scrollNext();
    setTimeout(() => this.setTransition(false), TRANSITION_DURATION + TRANSITION_CLEAR_BUFFER);
  }

  previous(): void {
    if (!this._embla) return;
    this.setTransition(true);
    this._embla.scrollPrev();
    setTimeout(() => this.setTransition(false), TRANSITION_DURATION + TRANSITION_CLEAR_BUFFER);
  }

  destroy(): void {
    if (this.dots && this.dotClickHandlers.size > 0) {
      this.dots.forEach((dot, index) => {
        const handler = this.dotClickHandlers.get(index);
        if (handler) {
          (dot as HTMLElement).removeEventListener('click', handler);
        }
      });
      this.dotClickHandlers.clear();
    }

    this.autoplay?.stop();
    this.autoplay = null;
    this._embla?.destroy();
    this._embla = null;
    this.dots = null;
  }
}