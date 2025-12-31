import { getLenisInstance } from '../smoothScroll';

let isInitialized = false;
let lenisInstance: any = null;

function updateProgress(scroll: number = 0): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  const progressFill = progressBar?.querySelector('.scroll-progress-bar-fill') as HTMLElement;

  if (!progressBar || !progressFill) return;

  const progress = Math.min(100, Math.max(0, scroll * 100));
  progressFill.style.setProperty('--scroll-progress-width', `${progress}%`);
}

function handleLenisScroll(data: { scroll: number }): void {
  updateProgress(data.scroll);
}

function handleResize(): void {
  if (lenisInstance) {
    setTimeout(() => updateProgress(lenisInstance.scroll), 100);
  }
}

export function initScrollProgress(): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  if (isInitialized) {
    if (lenisInstance) {
      updateProgress(lenisInstance.scroll);
    }
    return;
  }

  isInitialized = true;

  lenisInstance = getLenisInstance();

  if (lenisInstance) {
    lenisInstance.on('scroll', handleLenisScroll);
    updateProgress(lenisInstance.scroll);
  } else {
    console.warn('Lenis not initialized, scroll progress may not work correctly');
  }

  window.addEventListener('resize', handleResize, { passive: true });
}

export function cleanupScrollProgress(): void {
  if (lenisInstance) {
    lenisInstance.off('scroll', handleLenisScroll);
  }
  window.removeEventListener('resize', handleResize);
  isInitialized = false;
  lenisInstance = null;
}

