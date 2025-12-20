import { setupCarouselSection } from "../utils/carouselUtils.js";
import { setupPageAnimations } from "../utils/initUtils.js";
import { setupCounterAnimations } from "./counterAnimations.js";
import { setupAccordions } from "./accordions.js";
import { setupParallax } from "./parallax.js";

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
