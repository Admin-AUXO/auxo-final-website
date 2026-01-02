import { getLenisInstance } from '../smoothScroll';
import { getScrollPercentage } from '../utils/scrollHelpers';

let isInitialized = false;
let lenisInstance: any = null;
let scrollHandler: (() => void) | null = null;
let rafPending = false;

function updateProgress(scrollProgress: number = 0): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  const progressFill = progressBar?.querySelector('.scroll-progress-bar-fill') as HTMLElement;

  if (!progressBar || !progressFill) return;

  const progress = Math.min(100, Math.max(0, scrollProgress));
  progressFill.style.setProperty('--scroll-progress-width', `${progress}%`);
}

function calculateProgress(scrollTop: number): number {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const scrollableHeight = scrollHeight - viewportHeight;
  return scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
}

function handleLenisScroll(data: { scroll: number }): void {
  const scrollTop = data.scroll;
  updateProgress(calculateProgress(scrollTop));
}

function handleNativeScroll(): void {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      updateProgress(getScrollPercentage());
      rafPending = false;
    });
  }
}

function handleResize(): void {
  if (lenisInstance) {
    setTimeout(() => {
      const scrollTop = lenisInstance.scroll;
      updateProgress(calculateProgress(scrollTop));
    }, 100);
  } else {
    handleNativeScroll();
  }
}

export function initScrollProgress(): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  if (isInitialized) {
    handleNativeScroll();
    return;
  }

  isInitialized = true;

  lenisInstance = getLenisInstance();

  if (lenisInstance) {
    lenisInstance.on('scroll', handleLenisScroll);
    const scrollTop = lenisInstance.scroll;
    updateProgress(calculateProgress(scrollTop));
  } else {
    scrollHandler = handleNativeScroll;
    window.addEventListener('scroll', scrollHandler, { passive: true });
    handleNativeScroll();
  }

  window.addEventListener('resize', handleResize, { passive: true });
}

export function cleanupScrollProgress(): void {
  if (lenisInstance) {
    lenisInstance.off('scroll', handleLenisScroll);
    lenisInstance = null;
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  window.removeEventListener('resize', handleResize);
  rafPending = false;
  isInitialized = false;
}
