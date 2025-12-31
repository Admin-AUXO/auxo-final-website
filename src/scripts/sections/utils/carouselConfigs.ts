import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", controlSelector: ".code-carousel-control", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "mission-vision-carousel-container", controlSelector: ".mission-vision-carousel-control", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
  { containerId: "global-metrics-carousel-container", controlSelector: ".global-metrics-carousel-control", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 3500, loop: true } },
  { containerId: "capabilities-carousel-container", controlSelector: ".capabilities-carousel-control", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4500, loop: true } },
  { containerId: "services-carousel-container", controlSelector: ".services-carousel-control", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 6000, loop: true } },
  { containerId: "impact-carousel-container", controlSelector: ".impact-carousel-control", breakpoint: 0, activateOnDesktop: true, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "models-carousel-container", controlSelector: ".models-carousel-control", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5500, loop: true } },
  { containerId: "service-process-carousel-container", controlSelector: ".service-process-carousel-control", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
  { containerId: "service-benefits-carousel-container", controlSelector: ".service-benefits-carousel-control", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
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
