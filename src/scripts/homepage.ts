import { setupFadeInObserver } from "./utils/animationUtils";

// Homepage fade-in animations
export function setupHomepageAnimations(): void {
  setupFadeInObserver({
    selectors: [".animate-fade-in"],
  });
}

