import { initCarousel } from "../utils/carouselUtils";

export function initServicesCarousel() {
  return initCarousel({
    containerId: "services-carousel-container",
    dotSelector: ".services-carousel-dot",
    breakpoint: 1024,
  });
}

initServicesCarousel();

