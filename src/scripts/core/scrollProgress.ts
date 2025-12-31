let rafId: number | null = null;
let isInitialized = false;

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
  
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

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

function throttledUpdateMobile(): void {
  // On mobile, use a shorter throttle to improve responsiveness
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    updateProgress();
    rafId = null;
  });
}

function handleResize(): void {
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

  // Use mobile-optimized throttling on smaller screens
  const isMobile = window.innerWidth < 768;
  const scrollHandler = isMobile ? throttledUpdateMobile : throttledUpdate;

  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  updateProgress();
}

export function cleanupScrollProgress(): void {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener('scroll', throttledUpdate);
  window.removeEventListener('resize', handleResize);
  isInitialized = false;
}

