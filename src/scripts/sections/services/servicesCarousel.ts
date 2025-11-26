import { initCarousel } from "../utils/carouselUtils";

initCarousel({
  containerId: "services-carousel-container",
  dotSelector: ".services-carousel-dot",
  breakpoint: 1024,
});

export function initServicesCarousel(): void {
  // Carousel is auto-initialized via initCarousel
}

