import { setupSectionInit } from "../utils/initUtils";
import { setupHeroFollowContent } from "../utils/heroUtils";

export function initServicesHeroSection(): void {
  setupHeroFollowContent({
    followContentSelector: ".services-hero-follow-content",
    followContentDelay: 200,
    startDelay: 2000,
    heroId: "services-hero",
  });
}

// Initialize on page load
if (typeof window !== "undefined") {
  setupSectionInit(initServicesHeroSection);
}

