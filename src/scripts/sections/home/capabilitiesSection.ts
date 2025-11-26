import { initCarousel } from "../utils/carouselUtils";

const carouselManager = initCarousel({
  containerId: "capabilities-carousel-container",
  dotSelector: ".capabilities-carousel-dot",
  breakpoint: 768,
});

export function initCapabilitiesSection(): void {
  // Carousel is auto-initialized via initCarousel
}

