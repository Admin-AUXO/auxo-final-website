import { getLenisInstance } from '../smoothScroll';
import { isMobileDevice } from '../utils/deviceDetection';

let isInitialized = false;
let lenisInstance: any = null;
let scrollHandler: (() => void) | null = null;

function updateProgress(scrollProgress: number = 0): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  const progressFill = progressBar?.querySelector('.scroll-progress-bar-fill') as HTMLElement;

  if (!progressBar || !progressFill) return;

  const progress = Math.min(100, Math.max(0, scrollProgress));
  progressFill.style.setProperty('--scroll-progress-width', `${progress}%`);
}

function handleLenisScroll(data: { scroll: number }): void {
  updateProgress(data.scroll * 100);
}

function handleNativeScroll(): void {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  updateProgress(progress);
}

function handleResize(): void {
  if (lenisInstance) {
    setTimeout(() => updateProgress(lenisInstance.scroll * 100), 100);
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
    updateProgress(lenisInstance.scroll * 100);
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
  isInitialized = false;
}

