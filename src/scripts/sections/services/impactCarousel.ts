import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "impact-carousel-container",
  dotSelector: ".impact-carousel .carousel-dot",
  breakpoint: 0,
  activateOnDesktop: true,
});

export function initImpactCarousel(): void {
  carouselManager.init();
}

