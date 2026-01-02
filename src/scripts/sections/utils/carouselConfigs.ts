import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";
import { BREAKPOINTS } from "@/scripts/constants";

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: { autoplay: true, autoplayInterval: 4000, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "mission-vision-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: { autoplay: true, autoplayInterval: 6000, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "global-metrics-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: { autoplay: true, autoplayInterval: 3500, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "capabilities-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: { autoplay: true, autoplayInterval: 4500, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "services-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: { autoplay: true, autoplayInterval: 6000, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "impact-carousel-container", breakpoint: 0, activateOnDesktop: true, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "models-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: { autoplay: true, autoplayInterval: 5500, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "service-process-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true, pauseOnHover: false, align: 'center' } },
  { containerId: "service-benefits-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: { autoplay: true, autoplayInterval: 5000, loop: true, pauseOnHover: false, align: 'center' } },
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
