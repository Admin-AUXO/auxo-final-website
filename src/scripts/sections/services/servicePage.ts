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
    loop: true,
    pauseOnHover: true,
    align: 'start' as const
  },
};

export function setupServicePageAnimations(): void {
  setupPageAnimations();
  setupCounterAnimations();
  initAccordions();
  setupParallax();

  initCarousel({
    containerId: "service-process-carousel-container",
    ...CAROUSEL_CONFIG,
  });

  initCarousel({
    containerId: "service-benefits-carousel-container",
    ...CAROUSEL_CONFIG,
  });
}

export function cleanupServicePageAnimations(): void {
  cleanupParallax();
}
