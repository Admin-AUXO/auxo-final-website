import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

const DEFAULT_AUTOPLAY_INTERVAL = 3000;

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

  constructor(
    private container: HTMLElement,
    dots: NodeListOf<Element> | null = null,
    private options: EmblaCarouselOptions = {}
  ) {
    const {
      loop = true,
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

    this.embla = EmblaCarousel(container, {
      loop,
      align,
      slidesToScroll,
      dragFree,
      containScroll: 'trimSnaps',
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
          this.embla.scrollTo(index);
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
    this.embla.scrollTo(index);
  }

  next(): void {
    if (!this.embla) return;
    this.embla.scrollNext();
  }

  previous(): void {
    if (!this.embla) return;
    this.embla.scrollPrev();
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