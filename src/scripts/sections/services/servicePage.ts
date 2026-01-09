import { setupPageAnimations } from "../utils/initUtils";
import { setupCounterAnimations } from "./counterAnimations";
import { initAccordions } from "@/scripts/utils/accordions";
import { setupParallax, cleanupParallax } from "./parallax";
import { trackServiceView } from "@/scripts/analytics/ga4";

export function setupServicePageAnimations(): void {
  setupPageAnimations();
  setupCounterAnimations();
  initAccordions();
  setupParallax();

  const serviceName = document.querySelector('[data-service-name]')?.getAttribute('data-service-name');
  const serviceSlug = window.location.pathname.split('/').filter(Boolean).pop();

  if (serviceName && serviceSlug) {
    trackServiceView({
      id: serviceSlug,
      name: serviceName,
      category: 'data-analytics-services',
    });
  }
}

export function cleanupServicePageAnimations(): void {
  cleanupParallax();
}
