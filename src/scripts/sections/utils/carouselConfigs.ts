import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";
import { BREAKPOINTS } from "@/scripts/constants";

const DEFAULT_CAROUSEL_OPTIONS = {
  autoplay: true,
  autoplayInterval: 4000,
  loop: true,
  pauseOnHover: false,
  align: 'center' as const,
};

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  { containerId: "code-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "mission-vision-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "global-metrics-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "capabilities-carousel-container", breakpoint: BREAKPOINTS.MD, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "services-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "impact-carousel-container", breakpoint: 0, activateOnDesktop: true, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "models-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "service-process-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
  { containerId: "service-benefits-carousel-container", breakpoint: BREAKPOINTS.LG, carouselOptions: DEFAULT_CAROUSEL_OPTIONS },
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
