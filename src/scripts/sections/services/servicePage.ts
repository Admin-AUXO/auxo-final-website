import { setupCarouselSection } from "../utils/carouselUtils";
import { setupPageAnimations } from "../utils/initUtils";
import { setupCounterAnimations } from "./counterAnimations";
import { setupAccordions } from "./accordions";
import { setupParallax } from "./parallax";

const CAROUSEL_CONFIG = {
  breakpoint: 1024,
  activateOnDesktop: false,
};

export function setupServicePageAnimations(): void {
  setupPageAnimations();
  setupCounterAnimations();
  setupAccordions();
  setupParallax();

  setupCarouselSection({
    containerId: "service-process-carousel-container",
    dotSelector: ".service-process-carousel-dot",
    ...CAROUSEL_CONFIG,
  });

  setupCarouselSection({
    containerId: "service-benefits-carousel-container",
    dotSelector: ".service-benefits-carousel-dot",
    ...CAROUSEL_CONFIG,
  });
}
