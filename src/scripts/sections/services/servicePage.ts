import { initCarousel } from "@/scripts/utils/carousels";
import { setupPageAnimations } from "../utils/initUtils";
import { setupCounterAnimations } from "./counterAnimations";
import { initAccordions } from "@/scripts/utils/accordions";
import { setupParallax, cleanupParallax } from "./parallax";

const CAROUSEL_CONFIG = {
  breakpoint: 1024,
  activateOnDesktop: false,
  carouselOptions: {
    autoplay: true,
    autoplayInterval: 5000,
    loop: true
  },
};

export function setupServicePageAnimations(): void {
  setupPageAnimations();
  setupCounterAnimations();
  initAccordions();
  setupParallax();

  initCarousel({
    containerId: "service-process-carousel-container",
    controlSelector: ".service-process-carousel-control",
    ...CAROUSEL_CONFIG,
  });

  initCarousel({
    containerId: "service-benefits-carousel-container",
    controlSelector: ".service-benefits-carousel-control",
    ...CAROUSEL_CONFIG,
  });
}

export function cleanupServicePageAnimations(): void {
  cleanupParallax();
}
