let lenis: any = null;
let rafId: number | null = null;
let lenisCheckInterval: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

function checkLenis(): void {
  if (!lenis && window.lenis) {
    lenis = window.lenis;
  }
}

function updateProgress(): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  const progressFill = progressBar?.querySelector('.scroll-progress-bar-fill') as HTMLElement;

  if (!progressBar || !progressFill) return;

  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  
  let scrollTop = 0;
  if (lenis && typeof lenis.scroll === 'number') {
    scrollTop = lenis.scroll;
  } else if (window.lenis && typeof window.lenis.scroll === 'number') {
    scrollTop = window.lenis.scroll;
  } else {
    scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  const totalScrollableHeight = documentHeight - windowHeight;
  const scrollProgress = totalScrollableHeight > 0
    ? Math.min(100, Math.max(0, (scrollTop / totalScrollableHeight) * 100))
    : 0;

  progressFill.style.setProperty('--scroll-progress-width', `${scrollProgress}%`);
}

function throttledUpdate(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    updateProgress();
    rafId = null;
  });
}

function setupLenisListener(): boolean {
  checkLenis();
  if (lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', throttledUpdate);
    return true;
  }
  return false;
}

function handleResize(): void {
  checkLenis();
  setTimeout(updateProgress, 100);
}

export function initScrollProgress(): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  if (isInitialized) {
    updateProgress();
    return;
  }

  isInitialized = true;

  if (!setupLenisListener()) {
    window.addEventListener('lenis:init', () => {
      lenis = window.lenis;
      setupLenisListener();
    }, { once: true });
  }

  window.addEventListener('scroll', throttledUpdate, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  
  lenisCheckInterval = setInterval(() => {
    if (!lenis && window.lenis) {
      lenis = window.lenis;
      setupLenisListener();
      if (lenisCheckInterval) {
        clearInterval(lenisCheckInterval);
        lenisCheckInterval = null;
      }
    }
  }, 100);
  
  setTimeout(() => {
    if (lenisCheckInterval) {
      clearInterval(lenisCheckInterval);
      lenisCheckInterval = null;
    }
  }, 5000);

  updateProgress();
}

export function cleanupScrollProgress(): void {
  if (lenis && typeof lenis.off === 'function') {
    lenis.off('scroll', throttledUpdate);
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisCheckInterval) {
    clearInterval(lenisCheckInterval);
    lenisCheckInterval = null;
  }
  window.removeEventListener('scroll', throttledUpdate);
  window.removeEventListener('resize', handleResize);
  isInitialized = false;
  lenis = null;
}

