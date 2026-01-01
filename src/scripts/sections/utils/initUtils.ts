let lastPagePath = typeof window !== 'undefined' ? window.location.pathname : '';

export function setupSectionInit(initFn: () => void, cleanupFn?: () => void): void {
  const runInit = () => {
    const attemptInit = (attempts = 0) => {
      try {
        initFn();
      } catch (error) {
        if (import.meta.env.DEV && attempts < 3) {
          console.warn('Section init failed, retrying:', error);
          setTimeout(() => attemptInit(attempts + 1), 100 * (attempts + 1));
        }
      }
    };

    setTimeout(attemptInit, 50);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit, { once: true });
  } else {
    runInit();
  }

  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPagePath) {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(runInit)));
      lastPagePath = currentPath;
    }
  });

  if (cleanupFn) {
    document.addEventListener('astro:before-swap', cleanupFn);
  }
}

export function setupPageAnimations(): void {
  if (typeof window === 'undefined') return;

  import('../../utils/scrollReveal')
    .then((m) => m.refreshWithDelay())
    .catch((error) => {
      if (import.meta.env.DEV) console.error('Scroll animations refresh failed:', error);
    });
}
