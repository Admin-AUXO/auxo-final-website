import { initCarousel } from "../utils/carouselUtils";

initCarousel({
  containerId: "models-carousel-container",
  dotSelector: ".models-carousel-dot",
  breakpoint: 1024,
});

export function initModelsCarousel(): void {
  // Carousel is auto-initialized via initCarousel
}

