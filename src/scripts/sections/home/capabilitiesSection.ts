import { setupCarouselSection } from "../utils/carouselUtils";

const carouselManager = setupCarouselSection({
  containerId: "capabilities-carousel-container",
  dotSelector: ".capabilities-carousel .carousel-dot",
  breakpoint: 768,
});

export function cleanupCapabilitiesCarousel(): void {
  carouselManager.cleanup();
}

export function initCapabilitiesSection(): void {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => carouselManager.init());
  }
}

