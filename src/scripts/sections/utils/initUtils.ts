export function initOnReady(initFn: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFn, { once: true });
  } else {
    initFn();
  }
}

export function setupAstroPageLoad(initFn: () => void): void {
  document.addEventListener("astro:page-load", initFn);
}

export function setupAstroCleanup(cleanupFn: () => void): void {
  document.addEventListener("astro:before-swap", cleanupFn);
}

export function setupSectionInit(initFn: () => void, cleanupFn?: () => void): void {
  initOnReady(initFn);
  setupAstroPageLoad(initFn);
  if (cleanupFn) {
    setupAstroCleanup(cleanupFn);
  }
}

export function setupPageAnimations(): void {
  import('../../scrollAnimations').then(({ refreshScrollAnimationsWithDelay }) => {
    refreshScrollAnimationsWithDelay();
  });
}

