import { setupStaggeredAnimation } from "./animationUtils";

// Hero follow content configuration
export interface HeroFollowContentConfig {
  followContentSelector: string;
  followContentDelay: number;
  startDelay: number;
  heroId: string;
}

// Setup hero section follow content animation
export function setupHeroFollowContent(config: HeroFollowContentConfig): void {
  const { followContentSelector, followContentDelay, startDelay, heroId } = config;

  const heroSection = document.getElementById(heroId);
  if (!heroSection) return;

  // Reset animation states
  const followElements = document.querySelectorAll(followContentSelector);
  followElements.forEach((element) => {
    const el = element as HTMLElement;
    el.classList.remove("visible");
  });

  // Start animations after delay
  setTimeout(() => {
    setupStaggeredAnimation(
      followContentSelector,
      followContentDelay,
      (el) => el.classList.add("visible")
    );
  }, startDelay);
}

