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
    if (import.meta.env.DEV) {
      if (import.meta.env.DEV) console.error("Particle system failed:", error);
    }
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

function observeThemeChange(): void {
  if (typeof window === 'undefined') return;
  
  let lastTheme: 'dark' | 'light' = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  
  themeObserver = new MutationObserver(() => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (lastTheme !== currentTheme) {
      cleanup();
      setTimeout(waitForInit, 100);
      lastTheme = currentTheme;
    }
  });
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
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
    observeThemeChange();
  }
}

export function cleanupHeroBackground(): void {
  cleanup();
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
}

