import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { DragGesture } from '@use-gesture/vanilla';

const DEFAULT_AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 200;
const TRANSITION_CLEAR_BUFFER = 20;
const CAROUSEL_TRACK_SELECTOR = '.carousel-track, .embla__container, .carousel-container';
const DRAGGING_CLASS = 'is-dragging';
const NAVIGATING_CLASS = 'carousel-navigating';
const TRANSITION_CLASS = 'carousel-transition';
const SWIPE_THRESHOLD = 5;

export interface EmblaCarouselOptions {
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  pauseOnTouch?: boolean;
  align?: 'start' | 'center' | 'end';
  slidesToScroll?: number;
  dragFree?: boolean;
  onSlideChange?: (index: number) => void;
}

export class EmblaCarouselWrapper {
  private _embla: EmblaCarouselType | null = null;
  private autoplay: ReturnType<typeof Autoplay> | null = null;
  private onSlideChangeCallback?: (index: number) => void;
  private isDragging = false;
  private gestureHandler: DragGesture | null = null;
  private isHorizontalSwipe = false;
  private isAutoplayPaused = false;

  constructor(
    private container: HTMLElement,
    private options: EmblaCarouselOptions = {}
  ) {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const {
      loop = false,
      autoplay = false,
      autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
      pauseOnHover = true,
      pauseOnTouch = true,
      align = 'center',
      slidesToScroll = 1,
      dragFree = false,
      onSlideChange,
    } = options;

    this.onSlideChangeCallback = onSlideChange;

    const plugins = [];

    if (autoplay) {
      this.autoplay = Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: true, // Stop on user interaction
        stopOnMouseEnter: false, // We'll handle this manually
        stopOnFocusIn: false,
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
      dragThreshold: isMobile ? 3 : 8,
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

    this._embla.on('pointerDown', () => {
      this.isDragging = true;
      this.isHorizontalSwipe = false;
      this.container.classList.add(DRAGGING_CLASS);
      this.container.classList.remove(NAVIGATING_CLASS);
    });

    this._embla.on('pointerUp', () => {
      this.isDragging = false;
      this.container.classList.remove(DRAGGING_CLASS);

      // Resume autoplay after interaction, with mobile-specific timing
      if (this.autoplay && !this.autoplay.isPlaying()) {
        const resumeDelay = isMobile ? 2000 : 1000; // Longer delay on mobile
        setTimeout(() => {
          this.autoplay?.play();
        }, resumeDelay);
      }
    });

    this.setupGestureDetection();

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

    if (autoplay && this.autoplay) {
      // Ensure autoplay starts properly on all devices
      const startDelay = isMobile ? 500 : 100;
      setTimeout(() => {
        if (!this.autoplay?.isPlaying()) {
          this.autoplay?.play();
        }
        // Additional check for mobile devices
        if (isMobile) {
          setTimeout(() => {
            if (!this.autoplay?.isPlaying()) {
              this.autoplay?.play();
            }
          }, 1000);
        }
      }, startDelay);
    }
  }

  private onSelect(): void {
    if (!this._embla) return;

    const selectedIndex = this._embla.selectedScrollSnap();
    this.onSlideChangeCallback?.(selectedIndex);
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

  private setupGestureDetection(): void {
    const track = this.getTrack();
    if (!track) return;

    this.gestureHandler = new DragGesture(
      track,
      ({ active, movement: [mx, my], direction: [dx, dy], first, last }) => {
        if (first) {
          this.isHorizontalSwipe = false;
        }

        if (active) {
          const isHorizontal = Math.abs(dx) > Math.abs(dy);
          const horizontalDistance = Math.abs(mx);
          
          if (isHorizontal && horizontalDistance > SWIPE_THRESHOLD) {
            this.isHorizontalSwipe = true;
          } else if (!isHorizontal && Math.abs(my) > SWIPE_THRESHOLD) {
            this.isHorizontalSwipe = false;
          }
        }

        if (last) {
          setTimeout(() => {
            this.isHorizontalSwipe = false;
          }, 100);
        }
      },
      {
        axis: 'x',
        threshold: SWIPE_THRESHOLD,
        filterTaps: true,
        pointer: { touch: true, mouse: false },
        preventDefault: false,
      }
    );
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

  play(): void {
    if (this.autoplay) {
      this.autoplay.play();
    }
  }

  pause(): void {
    if (this.autoplay) {
      this.autoplay.stop();
    }
  }

  isPlaying(): boolean {
    return this.autoplay ? this.autoplay.isPlaying() : false;
  }

  hasAutoplay(): boolean {
    return this.autoplay !== null;
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
    if (this.gestureHandler) {
      this.gestureHandler.destroy();
      this.gestureHandler = null;
    }

    this.autoplay?.stop();
    this.autoplay = null;
    this._embla?.destroy();
    this._embla = null;
  }
}