let lastPagePath = typeof window !== 'undefined' ? window.location.pathname : '';

export function setupSectionInit(initFn: () => void, cleanupFn?: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFn, { once: true });
  } else {
    initFn();
  }

  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPagePath) {
      initFn();
      lastPagePath = currentPath;
    }
  });

  if (cleanupFn) {
    document.addEventListener('astro:before-swap', cleanupFn);
  }
}

export function setupPageAnimations(): void {
  if (typeof window === 'undefined') return;
  
  import('../../scrollAnimations')
    .then((m) => m.refreshScrollAnimationsWithDelay())
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Scroll animations refresh failed:', error);
      }
    });
}

