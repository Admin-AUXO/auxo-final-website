import { observeThemeChange } from './observers';
import { logger } from '@/lib/logger';

let particleSystem: any = null;
let isInitialized = false;
let themeObserver: MutationObserver | null = null;
let lastPath = '';

async function initParticleSystem(): Promise<void> {
  if (typeof window === "undefined" || isInitialized) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement;
  const container = document.getElementById("particle-background");
  if (!canvas || !container) return;

  try {
    const { GalaxyParticleSystem } = await import("@/scripts/particle-system");
    Object.assign(container.style, { display: "block", opacity: "1", visibility: "visible" });
    particleSystem = new GalaxyParticleSystem(canvas);
    isInitialized = true;
  } catch (error) {
    logger.error("Particle system failed:", error);
  }
}

function cleanup(): void {
  if (particleSystem) {
    particleSystem.destroy();
    particleSystem = null;
  }
  isInitialized = false;
}

function waitForInit(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForInit, { once: true });
    return;
  }
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) {
    setTimeout(waitForInit, 100);
    return;
  }
  initParticleSystem();
}

function setupThemeObservation(): void {
  if (typeof window === 'undefined') return;

  const unobserve = observeThemeChange(() => {
    cleanup();
    setTimeout(waitForInit, 100);
  });

  themeObserver = { disconnect: unobserve } as MutationObserver;
}

export function initHeroBackground(): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (currentPath === lastPath && isInitialized) return;

  lastPath = currentPath;

  if (document.readyState !== "loading") {
    waitForInit();
  } else {
    document.addEventListener("DOMContentLoaded", waitForInit, { once: true });
  }

  if (!themeObserver) {
    setupThemeObservation();
  }
}

export function cleanupHeroBackground(): void {
  cleanup();
  if (themeObserver && typeof themeObserver.disconnect === 'function') {
    themeObserver.disconnect();
    themeObserver = null;
  }
}

