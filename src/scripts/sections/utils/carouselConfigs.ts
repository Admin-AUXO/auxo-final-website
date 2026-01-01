import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "mission-vision-carousel-container", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
  { containerId: "global-metrics-carousel-container", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 3500, loop: true } },
  { containerId: "capabilities-carousel-container", breakpoint: 768, carouselOptions: { autoplay: true, autoplayInterval: 4500, loop: true } },
  { containerId: "services-carousel-container", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 6000, loop: true } },
  { containerId: "impact-carousel-container", breakpoint: 0, activateOnDesktop: true, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true } },
  { containerId: "models-carousel-container", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5500, loop: true } },
  { containerId: "service-process-carousel-container", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
  { containerId: "service-benefits-carousel-container", breakpoint: 1024, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true } },
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
