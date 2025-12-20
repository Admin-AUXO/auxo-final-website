import { initCarouselById, setupSectionInit } from "./utils";

const CAROUSEL_CONTAINERS = [
  "code-carousel-container",
  "mission-vision-carousel-container",
  "global-metrics-carousel-container",
  "capabilities-carousel-container",
  "services-carousel-container",
  "impact-carousel-container",
  "models-carousel-container",
] as const;

let isInitialized = false;

export function autoInitCarousels(): void {
  if (isInitialized) return;
  isInitialized = true;
  
  if (typeof document === 'undefined') return;
  
  CAROUSEL_CONTAINERS.forEach((containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      setupSectionInit(() => initCarouselById(containerId));
    }
  });
}
