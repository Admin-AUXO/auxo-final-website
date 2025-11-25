import { setupSectionInit } from "../utils/initUtils";

// Step animation delay
const STEP_ANIMATION_DELAY = 150;

// Initialize step animations
export function initMethodologySteps(): void {
  const steps = document.querySelectorAll(".method-step");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            (entry.target as HTMLElement).style.opacity = "1";
          }, index * STEP_ANIMATION_DELAY);
        }
      });
    },
    { threshold: 0.2 },
  );
  steps.forEach((step) => observer.observe(step));
}

// Initialize methodology section
export function initMethodologySection(): void {
  if (typeof window !== "undefined") {
    setupSectionInit(initMethodologySteps);
  }
}

