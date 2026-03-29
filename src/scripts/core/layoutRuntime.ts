import { initCoreFeatures, initPageFeatures, reinitOnPageLoad } from "@/scripts/core/init";
import { logger } from "@/lib/logger";

const TAB_ENGAGEMENT_CONFIG = {
  titleMessages: ["AUXO Data Labs | Decision-Grade Analytics"],
  titleInterval: 2000,
  faviconEnabled: true,
  inactivityThreshold: 300000,
  showWelcomeBack: true,
};

let hasInitialized = false;

function isTabEngagementEnabledForPage(): boolean {
  return document.body?.dataset.enableTabEngagement === "true";
}

function setLoadedState(): void {
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("loading");
  root.classList.add("loaded");

  if (body) {
    body.classList.remove("loading");
    body.classList.add("loaded");
  }
}

function saveScrollPosition(): void {
  try {
    sessionStorage.setItem("scroll-position", window.scrollY.toString());
  } catch {
    // Ignore storage failures.
  }
}

function restoreScrollPosition(): void {
  try {
    const scrollY = sessionStorage.getItem("scroll-position");
    if (scrollY && Number.parseInt(scrollY, 10) > 0 && !window.location.hash) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number.parseInt(scrollY, 10), behavior: "auto" });
      });
    }
    sessionStorage.removeItem("scroll-position");
  } catch {
    // Ignore storage failures.
  }
}

function setViewTransitionName(): void {
  if (!("startViewTransition" in document)) return;

  const main = document.querySelector("main");
  if (main) {
    (main as HTMLElement).style.viewTransitionName = "main-content";
  }
}

async function startTabEngagement(): Promise<void> {
  try {
    const { initTabEngagement } = await import("@/scripts/utils/tabEngagement");
    initTabEngagement(TAB_ENGAGEMENT_CONFIG);
  } catch (error) {
    logger.error("Tab engagement init error:", error);
  }
}

async function destroyTabEngagement(): Promise<void> {
  try {
    const { destroyTabEngagement } = await import("@/scripts/utils/tabEngagement");
    destroyTabEngagement();
  } catch {
    // No-op when module was not loaded.
  }
}

async function syncTabEngagementForCurrentPage(): Promise<void> {
  if (isTabEngagementEnabledForPage()) {
    await startTabEngagement();
    return;
  }

  await destroyTabEngagement();
}

function runInitialLoad(): void {
  if (hasInitialized) return;

  hasInitialized = true;
  initCoreFeatures();
  initPageFeatures();
  setLoadedState();
  void syncTabEngagementForCurrentPage();
}

function runPageLoad(): void {
  setViewTransitionName();
  restoreScrollPosition();
  reinitOnPageLoad();
  initPageFeatures();
  setLoadedState();
  void syncTabEngagementForCurrentPage();
}

function attachListeners(): void {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  document.addEventListener("astro:before-preparation", saveScrollPosition);
  document.addEventListener("astro:before-preparation", () => {
    void destroyTabEngagement();
    setViewTransitionName();
  });
  document.addEventListener("astro:after-swap", setViewTransitionName);
  document.addEventListener("astro:page-load", runPageLoad);
  window.addEventListener("load", setLoadedState, { once: true });
}

if (!window.__auxoLayoutRuntimeInitialized) {
  window.__auxoLayoutRuntimeInitialized = true;
  attachListeners();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        setViewTransitionName();
        runInitialLoad();
      },
      { once: true },
    );
  } else {
    setViewTransitionName();
    runInitialLoad();
  }
}

declare global {
  interface Window {
    __auxoLayoutRuntimeInitialized?: boolean;
  }
}
