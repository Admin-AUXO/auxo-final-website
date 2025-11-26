import { initCarousel } from "../utils/carouselUtils";

initCarousel({
  containerId: "code-carousel-container",
  dotSelector: ".code-carousel-dot",
  breakpoint: 768,
});

export function initCodeCarousel(): void {
  // Carousel is auto-initialized via initCarousel
}

