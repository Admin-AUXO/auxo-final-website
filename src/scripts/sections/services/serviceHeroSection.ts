import { setupSectionInit } from "../utils/initUtils";
import { setupHeroFollowContent } from "../utils/heroUtils";

export function initServiceHeroSection(): void {
  setupHeroFollowContent({
    followContentSelector: ".service-hero-follow-content",
    followContentDelay: 150,
    startDelay: 1200,
    heroId: "service-hero",
  });
}

// Initialize on page load
if (typeof window !== "undefined") {
  setupSectionInit(initServiceHeroSection);
}
