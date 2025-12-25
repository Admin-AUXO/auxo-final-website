import { initCarousel } from "@/scripts/utils/carousels";
import { setupPageAnimations } from "../utils/initUtils";
import { setupCounterAnimations } from "./counterAnimations";
import { initAccordions } from "@/scripts/utils/accordions";
import { setupParallax } from "./parallax";

const CAROUSEL_CONFIG = {
  breakpoint: 1024,
  activateOnDesktop: false,
};

export function setupServicePageAnimations(): void {
  setupPageAnimations();
  setupCounterAnimations();
  initAccordions();
  setupParallax();

  initCarousel({
    containerId: "service-process-carousel-container",
    dotSelector: ".service-process-carousel-dot",
    ...CAROUSEL_CONFIG,
  });

  initCarousel({
    containerId: "service-benefits-carousel-container",
    dotSelector: ".service-benefits-carousel-dot",
    ...CAROUSEL_CONFIG,
  });
}
