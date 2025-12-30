import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", dotSelector: ".code-carousel-dot", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "mission-vision-carousel-container", dotSelector: ".mission-vision-carousel-dot", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
  { containerId: "global-metrics-carousel-container", dotSelector: ".global-metrics-carousel-dot", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 3500, loop: true } },
  { containerId: "capabilities-carousel-container", dotSelector: ".capabilities-carousel-dot", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4500, loop: true } },
  { containerId: "services-carousel-container", dotSelector: ".services-carousel-dot", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 6000, loop: true } },
  { containerId: "impact-carousel-container", dotSelector: ".impact-carousel-dot", breakpoint: 0, activateOnDesktop: true, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "models-carousel-container", dotSelector: ".models-carousel-dot", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5500, loop: true } },
];

export function initAllCarousels(): void {
  CAROUSEL_CONFIGS.forEach(config => initCarousel(config));
}

export function initCarouselById(containerId: string): void {
  const config = CAROUSEL_CONFIGS.find(c => c.containerId === containerId);
  if (config) {
    initCarousel(config);
  }
}
