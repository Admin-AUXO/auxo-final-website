import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "models-carousel-container",
  dotSelector: ".models-carousel .carousel-dot",
  breakpoint: 1024,
});

export function initModelsCarousel(): void {
  carouselManager.init();
}

