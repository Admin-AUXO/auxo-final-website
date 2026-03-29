import { logger } from "@/lib/logger";

interface ParticleSystem {
  destroy: () => void;
}

let particleSystem: ParticleSystem | null = null;
let isInitialized = false;
let activeContainer: HTMLElement | null = null;
let stopVisibilityObserver: (() => void) | null = null;

function observeOnce(
  element: Element,
  callback: () => void,
  options: IntersectionObserverInit = {},
): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    callback();
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      callback();
      observer.unobserve(element);
      observer.disconnect();
      break;
    }
  }, options);

  observer.observe(element);

  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

async function initParticleSystem(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
): Promise<void> {
  if (isInitialized) return;

  try {
    const { GalaxyParticleSystem } = await import("@/scripts/particle-system");
    const mode = (container.getAttribute("data-mode") || "galaxy") as any;

    particleSystem = new GalaxyParticleSystem(canvas, mode);
    isInitialized = true;
  } catch (error) {
    logger.error("Particle system failed:", error);
  }
}

function cleanup(): void {
  if (stopVisibilityObserver) {
    stopVisibilityObserver();
    stopVisibilityObserver = null;
  }

  if (particleSystem) {
    particleSystem.destroy();
    particleSystem = null;
  }

  activeContainer = null;
  isInitialized = false;
}

export function initHeroBackground(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const container = document.getElementById("particle-background") as
    | HTMLElement
    | null;
  const canvas = document.getElementById("particle-canvas") as
    | HTMLCanvasElement
    | null;

  if (!container || !canvas) return;
  if (isInitialized && activeContainer === container) return;

  cleanup();
  activeContainer = container;

  stopVisibilityObserver = observeOnce(
    container,
    () => {
      void initParticleSystem(canvas, container);
    },
    { rootMargin: "200px" },
  );
}

export function cleanupHeroBackground(): void {
  cleanup();
}
