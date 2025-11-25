import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "global-metrics-carousel-container",
  dotSelector: ".global-metrics-carousel .carousel-dot",
  breakpoint: 768,
});

export function initGlobalMetricsCarousel(): void {
  carouselManager.init();
}

