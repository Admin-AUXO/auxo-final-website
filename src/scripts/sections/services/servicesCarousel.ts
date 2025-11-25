import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "services-carousel-container",
  dotSelector: ".services-carousel .carousel-dot",
  breakpoint: 1024,
});

export function initServicesCarousel(): void {
  carouselManager.init();
}

