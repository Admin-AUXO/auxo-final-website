let ticking = false;
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

function onScroll(): void {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
    ticking = true;
  }
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

  // Use unified scroll handler with passive: true for better performance
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  updateProgress();
}

export function cleanupScrollProgress(): void {
  if (ticking) {
    ticking = false;
  }
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', handleResize);
  isInitialized = false;
}

