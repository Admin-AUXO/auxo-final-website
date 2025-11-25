import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "code-carousel-container",
  dotSelector: ".code-principles-carousel .carousel-dot",
  breakpoint: 768,
});

export function initCodeCarousel(): void {
  carouselManager.init();
}

