import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

const DEFAULT_AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 300; // Smooth transition duration in ms
const SETTLE_DURATION = 150; // Time to wait after drag ends before re-enabling transitions

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
  private embla: EmblaCarouselType | null = null;
  private autoplay: ReturnType<typeof Autoplay> | null = null;
  private dots: NodeListOf<Element> | null = null;
  private onSlideChangeCallback?: (index: number) => void;
  private dotClickHandlers: Map<number, () => void> = new Map();
  private isDragging = false;
  private settleTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private container: HTMLElement,
    dots: NodeListOf<Element> | null = null,
    private options: EmblaCarouselOptions = {}
  ) {
    const {
      loop = false, // Default to no loop
      autoplay = false,
      autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
      align = 'center',
      slidesToScroll = 1, // Always scroll one card at a time
      dragFree = false, // Disable free dragging - snap to one card per swipe
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

    this.embla = EmblaCarousel(container, {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: 'trimSnaps',
      duration: 20, // Fast snap duration for responsive feel
      dragThreshold: 10, // Pixels before drag starts
      skipSnaps: false, // Always snap to each slide
    }, plugins);

    if (this.dots && this.dots.length > 0) {
      this.setupDots();
    }

    this.embla.on('select', () => {
      this.onSelect();
    });

    this.embla.on('reInit', () => {
      this.onSelect();
    });

    // Handle drag start - disable CSS transitions for immediate feedback
    this.embla.on('pointerDown', () => {
      this.isDragging = true;
      if (this.settleTimeout) {
        clearTimeout(this.settleTimeout);
        this.settleTimeout = null;
      }
      const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
      if (track) {
        track.style.transition = 'none';
        this.container.classList.add('is-dragging');
      }
    });

    // Handle drag end - re-enable smooth transitions after settling
    this.embla.on('pointerUp', () => {
      this.isDragging = false;
      const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
      if (track) {
        // Wait for embla to settle, then re-enable smooth transitions
        this.settleTimeout = setTimeout(() => {
          if (!this.isDragging) {
            track.style.transition = '';
            this.container.classList.remove('is-dragging');
          }
        }, SETTLE_DURATION);
      }
    });

    // Handle settle event - ensure clean state after animation completes
    this.embla.on('settle', () => {
      if (!this.isDragging) {
        const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
        if (track) {
          track.style.transition = '';
          this.container.classList.remove('is-dragging');
        }
      }
    });

    this.onSelect();
  }

  private onSelect(): void {
    if (!this.embla) return;
    
    const selectedIndex = this.embla.selectedScrollSnap();
    this.updateDots(selectedIndex);
    
    if (this.onSlideChangeCallback) {
      this.onSlideChangeCallback(selectedIndex);
    }
  }

  private setupDots(): void {
    if (!this.dots || !this.embla) return;

    const scrollSnaps = this.embla.scrollSnapList();

    this.dots.forEach((dot, index) => {
      if (index >= scrollSnaps.length) return;

      const dotElement = dot as HTMLElement;
      const clickHandler = () => {
        if (this.embla) {
          // Enable smooth transition for dot navigation
          this.container.classList.add('carousel-navigating');
          const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
          if (track) {
            // Use smooth CSS transition for dot clicks
            track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
          }

          // Scroll to selected slide
          this.embla.scrollTo(index);

          // Clean up after transition completes
          setTimeout(() => {
            if (track && !this.isDragging) {
              track.style.transition = '';
            }
            this.container.classList.remove('carousel-navigating');
          }, TRANSITION_DURATION + 50);
        }
      };

      this.dotClickHandlers.set(index, clickHandler);
      dotElement.addEventListener('click', clickHandler);
    });
  }

  private updateDots(selectedIndex: number): void {
    if (!this.dots || !this.embla) return;

    const scrollSnaps = this.embla.scrollSnapList();
    const validIndex = Math.min(selectedIndex, scrollSnaps.length - 1);

    this.dots.forEach((dot, index) => {
      const dotElement = dot as HTMLElement;
      
      if (index >= scrollSnaps.length) {
        dotElement.style.setProperty('display', 'none', 'important');
        return;
      }
      
      dotElement.style.removeProperty('display');
      
      if (index === validIndex) {
        dotElement.classList.add('active');
        dotElement.setAttribute('aria-current', 'true');
        dotElement.setAttribute('aria-selected', 'true');
        dotElement.setAttribute('tabindex', '0');
      } else {
        dotElement.classList.remove('active');
        dotElement.removeAttribute('aria-current');
        dotElement.setAttribute('aria-selected', 'false');
        dotElement.setAttribute('tabindex', '-1');
      }
    });
  }

  goToSlide(index: number): void {
    if (!this.embla) return;
    // Use smooth transition for programmatic navigation
    const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
    if (track) {
      track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
    }
    this.embla.scrollTo(index);
    setTimeout(() => {
      if (track && !this.isDragging) {
        track.style.transition = '';
      }
    }, TRANSITION_DURATION + 50);
  }

  next(): void {
    if (!this.embla) return;
    // Use smooth transition for next button
    const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
    if (track) {
      track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
    }
    this.embla.scrollNext();
    setTimeout(() => {
      if (track && !this.isDragging) {
        track.style.transition = '';
      }
    }, TRANSITION_DURATION + 50);
  }

  previous(): void {
    if (!this.embla) return;
    // Use smooth transition for previous button
    const track = this.container.querySelector('.carousel-track, .embla__container') as HTMLElement;
    if (track) {
      track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
    }
    this.embla.scrollPrev();
    setTimeout(() => {
      if (track && !this.isDragging) {
        track.style.transition = '';
      }
    }, TRANSITION_DURATION + 50);
  }

  destroy(): void {
    // Clear any pending timeouts
    if (this.settleTimeout) {
      clearTimeout(this.settleTimeout);
      this.settleTimeout = null;
    }

    if (this.dots && this.dotClickHandlers.size > 0) {
      this.dots.forEach((dot, index) => {
        const handler = this.dotClickHandlers.get(index);
        if (handler) {
          (dot as HTMLElement).removeEventListener('click', handler);
        }
      });
      this.dotClickHandlers.clear();
    }

    if (this.autoplay) {
      this.autoplay.stop();
      this.autoplay = null;
    }

    if (this.embla) {
      this.embla.destroy();
      this.embla = null;
    }

    this.dots = null;
  }
}