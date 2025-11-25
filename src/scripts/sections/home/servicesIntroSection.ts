import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "services-carousel-container",
  dotSelector: ".services-carousel-mobile .carousel-dot",
  breakpoint: 1024,
  resizeDebounceDelay: 150,
});

export function initServicesCarousel(): void {
  carouselManager.init();
}

export function initServicesIntroSection(): void {
  carouselManager.init();
}

