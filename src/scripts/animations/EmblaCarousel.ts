import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { BREAKPOINTS } from '../constants';

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
  private gestureCleanup: (() => void) | null = null;
  private isHorizontalSwipe = false;

  constructor(
    private container: HTMLElement,
    private options: EmblaCarouselOptions = {}
  ) {
    const isMobile = typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.MD;

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
        stopOnInteraction: false, // Resume after user interaction - never stop completely
        stopOnMouseEnter: pauseOnHover, // Only pause on hover if explicitly enabled
        stopOnFocusIn: false, // Don't pause on focus to avoid accidental stops
        playOnInit: true, // Always start playing
        stopOnLastSnap: false, // Keep going in loops
        rootNode: (emblaRoot) => emblaRoot.parentElement, // Use parent for better event handling
      });
      plugins.push(this.autoplay);
    }

    this._embla = EmblaCarousel(container, {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: false,
      duration: 25,
      dragThreshold: 5,
      skipSnaps: false,
      watchDrag: true,
      watchResize: true,
      watchSlides: true,
      axis: 'x',
      inViewThreshold: 0,
      startIndex: 0,
      watchFocus: false,
      breakpoints: {
        '(min-width: 768px)': {
          dragThreshold: 3,
        }
      },
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
      // Autoplay resumes automatically with stopOnInteraction: false
    });

    this.setupGestureDetection();

    this._embla.on('settle', () => {
      if (!this.isDragging) {
        this.container.classList.remove(DRAGGING_CLASS);
        this.container.classList.remove(NAVIGATING_CLASS);
      }
    });

    // Don't force scroll to position 0 - allow natural looping behavior
    // This ensures carousels maintain their position and truly loop
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

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isActive = false;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;

      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      isActive = false;
      this.isHorizontalSwipe = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;

      currentX = e.clientX;
      currentY = e.clientY;

      const dx = currentX - startX;
      const dy = currentY - startY;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const horizontalDistance = Math.abs(dx);

      if (isHorizontal && horizontalDistance > SWIPE_THRESHOLD) {
        isActive = true;
        this.isHorizontalSwipe = true;
      } else if (!isHorizontal && Math.abs(dy) > SWIPE_THRESHOLD) {
        this.isHorizontalSwipe = false;
      }
    };

    const handlePointerUp = () => {
      if (isActive) {
        setTimeout(() => {
          this.isHorizontalSwipe = false;
        }, 100);
      }
      isActive = false;
    };

    track.addEventListener('pointerdown', handlePointerDown);
    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', handlePointerUp);
    track.addEventListener('pointercancel', handlePointerUp);

    this.gestureCleanup = () => {
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', handlePointerUp);
      track.removeEventListener('pointercancel', handlePointerUp);
    };
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
    if (this.gestureCleanup) {
      this.gestureCleanup();
      this.gestureCleanup = null;
    }

    this.autoplay?.stop();
    this.autoplay = null;
    this._embla?.destroy();
    this._embla = null;
  }
}