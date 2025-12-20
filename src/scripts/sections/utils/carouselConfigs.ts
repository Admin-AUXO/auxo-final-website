import { setupCarouselSection, type CarouselConfig } from "./carouselUtils";

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", dotSelector: ".code-carousel-dot", breakpoint: 768 },
  { containerId: "mission-vision-carousel-container", dotSelector: ".mission-vision-carousel-dot", breakpoint: 1024 },
  { containerId: "global-metrics-carousel-container", dotSelector: ".global-metrics-carousel-dot", breakpoint: 768 },
  { containerId: "capabilities-carousel-container", dotSelector: ".capabilities-carousel-dot", breakpoint: 768 },
  { containerId: "services-carousel-container", dotSelector: ".services-carousel-dot", breakpoint: 1024 },
  { containerId: "impact-carousel-container", dotSelector: ".impact-carousel-dot", breakpoint: 0, activateOnDesktop: true },
  { containerId: "models-carousel-container", dotSelector: ".models-carousel-dot", breakpoint: 1024 },
];

export function initAllCarousels(): void {
  CAROUSEL_CONFIGS.forEach(config => setupCarouselSection(config));
}

export function initCarouselById(containerId: string): void {
  const config = CAROUSEL_CONFIGS.find(c => c.containerId === containerId);
  if (config) {
    setupCarouselSection(config);
  }
}
