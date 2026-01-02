import { setupSectionInit } from "./utils";

let isInitialized = false;

export function autoInitCarousels(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (typeof document === 'undefined') return;

  import('./utils/carouselConfigs').then(({ CAROUSEL_CONFIGS, initCarouselById }) => {
    CAROUSEL_CONFIGS.forEach(({ containerId }) => {
      const container = document.getElementById(containerId);
      if (container) {
        setupSectionInit(() => {
          initCarouselById(containerId);
        });
      }
    });
  }).catch((error) => {
    if (import.meta.env.DEV) console.error('Failed to load carousel configs:', error);
  });
}
