import { initCarousel } from "../utils/carouselUtils";

const carouselManager = initCarousel({
  containerId: "services-carousel-container",
  dotSelector: ".services-carousel-dot",
  breakpoint: 1024,
});

export function initServicesIntroSection(): void {
  // Carousel is auto-initialized via initCarousel
}

