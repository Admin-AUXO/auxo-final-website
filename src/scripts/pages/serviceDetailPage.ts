import {
  setupServicePageAnimations,
  cleanupServicePageAnimations,
} from "@/scripts/sections/services/servicePage";

function runSetup(): void {
  if (!document.querySelector("[data-service-name]")) return;
  setupServicePageAnimations();
}

if (!window.__auxoServiceDetailPageBound) {
  window.__auxoServiceDetailPageBound = true;
  document.addEventListener("astro:page-load", runSetup);
  document.addEventListener(
    "astro:before-preparation",
    cleanupServicePageAnimations,
  );
}

runSetup();
