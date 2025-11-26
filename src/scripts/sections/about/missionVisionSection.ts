import { initCarousel } from "../utils/carouselUtils";

initCarousel({
  containerId: "mission-vision-carousel-container",
  dotSelector: ".mission-vision-carousel-dot",
  breakpoint: 1024,
});

export function initMissionVisionCarousel(): void {
  // Carousel is auto-initialized via initCarousel
}

