import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "mission-vision-carousel-container",
  dotSelector: ".mission-vision-carousel .carousel-dot",
  breakpoint: 1024,
});

export function initMissionVisionCarousel(): void {
  carouselManager.init();
}

