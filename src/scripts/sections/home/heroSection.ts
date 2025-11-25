import { TypingAnimation } from "../../animations";
import { setupSectionInit } from "../utils/initUtils";

// Animation delay between elements
const FOLLOW_CONTENT_DELAY = 150;
// Fallback timeout if animation fails
const TYPING_FALLBACK_TIMEOUT = 5000;
// Delay before starting animation
const TYPING_START_DELAY = 200;

let titleAnimation: TypingAnimation | null = null;

// Show follow content with staggered animation
function showFollowContent(): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const followElements = document.querySelectorAll(".hero-follow-content");

  followElements.forEach((element, index) => {
    const el = element as HTMLElement;

    if (prefersReducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    } else {
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, index * FOLLOW_CONTENT_DELAY);
    }
  });
}

function resetAnimationStates(): void {
  const typingHighlight = document.getElementById("typing-highlight");
  if (typingHighlight) {
    typingHighlight.textContent = "";
  }

  const followElements = document.querySelectorAll(".hero-follow-content");
  const root = document.documentElement;
  const translateYValue =
    getComputedStyle(root).getPropertyValue("--transform-translate-y-sm").trim() ||
    "0.9375rem";

  followElements.forEach((element) => {
    const el = element as HTMLElement;
    el.style.opacity = "0";
    el.style.transform = `translateY(${translateYValue})`;
    el.style.transition = "";
  });
}

export function setupHeroAnimations(): void {
  const heroSection = document.getElementById("hero");
  if (!heroSection) return;

  resetAnimationStates();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const fallbackTimeout = setTimeout(() => {
    showFollowContent();
  }, TYPING_FALLBACK_TIMEOUT);

  requestAnimationFrame(() => {
    const typingHighlight = document.getElementById("typing-highlight");
    const highlightText = typingHighlight?.getAttribute("data-highlight-text");

    if (typingHighlight && highlightText) {
      if (titleAnimation) {
        titleAnimation.stop();
      }

      if (prefersReducedMotion) {
        clearTimeout(fallbackTimeout);
        typingHighlight.textContent = highlightText;
        showFollowContent();
      } else {
        titleAnimation = new TypingAnimation(typingHighlight, highlightText, {
          speed: 80,
          loop: false,
          showCursor: false,
          onComplete: () => {
            clearTimeout(fallbackTimeout);
            showFollowContent();
          },
        });
        setTimeout(() => {
          titleAnimation?.start();
        }, TYPING_START_DELAY);
      }
    } else {
      clearTimeout(fallbackTimeout);
      showFollowContent();
    }
  });
}

export function cleanupHeroAnimations(): void {
  if (titleAnimation) {
    titleAnimation.stop();
    titleAnimation = null;
  }
  resetAnimationStates();
}

// Initialize hero section animations
export function initHeroSection(): void {
  if (typeof window !== "undefined") {
    setupSectionInit(setupHeroAnimations, cleanupHeroAnimations);
  }
}

