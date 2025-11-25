import { setupSectionInit } from "../utils/initUtils";
import {
  createAnimationObserver,
  triggerAnimationPlayState,
} from "../utils/animationUtils";

// Initialize value proposition animations
export function initValuePropAnimations(): void {
  const container = document.querySelector("#value-proposition");
  if (!container) return;

  const highlightText = container.querySelector(".highlight-text") as HTMLElement;
  const underline = container.querySelector(".underline-line") as HTMLElement;
  const fadeInTexts = container.querySelectorAll(".fade-in-text");

  const triggerAnimations = () => {
    if (highlightText) {
      highlightText.style.animationPlayState = "running";
    }
    if (underline) {
      underline.style.animationPlayState = "running";
    }
    triggerAnimationPlayState(fadeInTexts);
  };

  triggerAnimations();

  const observer = createAnimationObserver(() => {
    triggerAnimations();
  });

  observer.observe(container);
}

// Initialize value proposition section
export function initValueProposition(): void {
  if (typeof window !== "undefined") {
    setupSectionInit(initValuePropAnimations);
  }
}

