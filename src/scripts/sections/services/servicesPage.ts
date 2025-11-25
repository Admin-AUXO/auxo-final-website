import { initServicesCarousel } from "./servicesCarousel";
import { setupPageAnimations } from "../utils/pageUtils";

export function setupServicesPageAnimations() {
  setupPageAnimations([initServicesCarousel]);
}

