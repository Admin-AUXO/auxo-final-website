import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { DragGesture } from '@use-gesture/vanilla';

const DEFAULT_AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 200;
const TRANSITION_CLEAR_BUFFER = 20;
const CAROUSEL_TRACK_SELECTOR = '.carousel-track, .embla__container';
const DRAGGING_CLASS = 'is-dragging';
const NAVIGATING_CLASS = 'carousel-navigating';
const TRANSITION_CLASS = 'carousel-transition';
const DOT_HIDDEN_CLASS = 'carousel-dot-hidden';
const ACTIVE_CLASS = 'active';
const SWIPE_THRESHOLD = 5;

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
  private gestureHandler: DragGesture | null = null;
  private isHorizontalSwipe = false;

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
      duration: isMobile ? 10 : 20,
      dragThreshold: isMobile ? 5 : 8,
      skipSnaps: false,
      watchDrag: true,
      watchResize: true,
      watchSlides: true,
      axis: 'x',
      inViewThreshold: 0,
      startIndex: 0,
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
      this.isHorizontalSwipe = false;
      this.container.classList.add(DRAGGING_CLASS);
      this.container.classList.remove(NAVIGATING_CLASS);
      if (window.lenis) {
        window.lenis.stop();
      }
    });

    this._embla.on('pointerUp', () => {
      this.isDragging = false;
      this.container.classList.remove(DRAGGING_CLASS);
      if (window.lenis && !this.isHorizontalSwipe) {
        setTimeout(() => {
          if (window.lenis && !this.isHorizontalSwipe) {
            window.lenis.start();
          }
        }, 100);
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
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.dots.forEach((dot, index) => {
      if (index >= scrollSnaps.length) return;

      const dotElement = dot as HTMLElement;
      let touchStartTime = 0;
      let touchStartX = 0;
      let touchStartY = 0;

      const handleClick = (e?: Event) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
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

      const touchStartHandler = (e: TouchEvent) => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      };

      const touchEndHandler = (e: TouchEvent) => {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);
        const isTap = deltaX < 10 && deltaY < 10 && touchDuration < 300;

        if (isTap) {
          e.preventDefault();
          e.stopPropagation();
          handleClick(e);
        }
      };

      this.dotClickHandlers.set(index, handleClick);
      dotElement.addEventListener('click', handleClick);
      
      if (isTouchDevice) {
        dotElement.addEventListener('touchstart', touchStartHandler, { passive: true });
        dotElement.addEventListener('touchend', touchEndHandler, { passive: false });
      }
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
            if (window.lenis) {
              window.lenis.stop();
            }
          } else if (!isHorizontal && Math.abs(my) > SWIPE_THRESHOLD) {
            this.isHorizontalSwipe = false;
            if (window.lenis && !window.lenis.isStopped) {
              window.lenis.start();
            }
          }
        }

        if (last) {
          if (window.lenis && !window.lenis.isStopped) {
            window.lenis.start();
          }
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

    if (this.gestureHandler) {
      this.gestureHandler.destroy();
      this.gestureHandler = null;
    }

    this.autoplay?.stop();
    this.autoplay = null;
    this._embla?.destroy();
    this._embla = null;
    this.dots = null;
  }
}