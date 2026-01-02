import { setupSectionInit } from "./utils";
import { CAROUSEL_CONFIGS, initCarouselById } from "./utils/carouselConfigs";

let isInitialized = false;

export function autoInitCarousels(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (typeof document === 'undefined') return;

  CAROUSEL_CONFIGS.forEach(({ containerId }) => {
    const container = document.getElementById(containerId);
    if (container) {
      setupSectionInit(() => {
        initCarouselById(containerId);
      });
    }
  });
}

if (typeof window !== 'undefined') {
  (window as any).autoInitCarousels = autoInitCarousels;
}
