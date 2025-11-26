import { initCarousel } from "../utils/carouselUtils";

initCarousel({
  containerId: "global-metrics-carousel-container",
  dotSelector: ".global-metrics-carousel-dot",
  breakpoint: 768,
});

export function initGlobalMetricsCarousel(): void {
  // Carousel is auto-initialized via initCarousel
}

