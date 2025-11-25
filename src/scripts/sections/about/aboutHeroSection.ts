import { setupSectionInit } from "../utils/initUtils";
import { setupHeroFollowContent } from "../utils/heroUtils";

export function initAboutHeroSection(): void {
  setupHeroFollowContent({
    followContentSelector: ".about-hero-follow-content",
    followContentDelay: 200,
    startDelay: 800,
    heroId: "about-hero",
  });
}

// Initialize on page load
if (typeof window !== "undefined") {
  setupSectionInit(initAboutHeroSection);
}

