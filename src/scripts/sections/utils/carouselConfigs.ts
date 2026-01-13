import { initCarousel, type CarouselConfig } from "@/scripts/utils/carousels";
import { BREAKPOINTS } from "@/scripts/constants";

const BASE_OPTIONS = {
  loop: true,
  autoplay: true,
  pauseOnHover: false,
  align: 'center' as const,
  dragFree: false,
  skipSnaps: false,
};

export const CAROUSEL_CONFIGS: CarouselConfig[] = [
  {
    containerId: "code-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4000 },
  },
  {
    containerId: "mission-vision-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5000 },
  },
  {
    containerId: "global-metrics-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 3500 },
  },
  {
    containerId: "capabilities-carousel-container",
    breakpoint: BREAKPOINTS.MD,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4500 },
  },
  {
    containerId: "services-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5000 },
  },
  {
    containerId: "impact-carousel-container",
    breakpoint: 0,
    activateOnDesktop: true,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4000 },
  },
  {
    containerId: "models-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5500 },
  },
  {
    containerId: "service-process-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 5000 },
  },
  {
    containerId: "service-benefits-carousel-container",
    breakpoint: BREAKPOINTS.LG,
    carouselOptions: { ...BASE_OPTIONS, autoplayInterval: 4500 },
  },
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
