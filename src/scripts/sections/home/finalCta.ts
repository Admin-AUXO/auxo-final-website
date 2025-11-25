import { setupSectionInit } from "../utils/initUtils";
import {
  createAnimationObserver,
  triggerAnimationPlayState,
} from "../utils/animationUtils";

// Initialize final CTA animations
export function initFinalCtaAnimations(): void {
  const container = document.querySelector("#final-cta");
  if (!container) return;

  const highlightText = container.querySelector(".highlight-cta-text") as HTMLElement;
  const fadeInElements = container.querySelectorAll(
    ".fade-in-up, .fade-in-up-delay, .fade-in-up-delay-2, .fade-in-up-delay-3"
  );

  const triggerAnimations = () => {
    if (highlightText) {
      highlightText.style.animationPlayState = "running";
    }
    triggerAnimationPlayState(fadeInElements);
  };

  triggerAnimations();

  const observer = createAnimationObserver(() => {
    triggerAnimations();
  });

  observer.observe(container);
}

// Initialize final CTA section
export function initFinalCta(): void {
  if (typeof window !== "undefined") {
    setupSectionInit(initFinalCtaAnimations);
  }
}

