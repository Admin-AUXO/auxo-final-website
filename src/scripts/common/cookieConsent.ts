import {
  initConsentMode,
  acceptAllConsent,
  rejectAllConsent,
  updateConsent,
  hasConsentChoice,
  getStoredConsent,
  type ConsentPreferences,
} from "@/scripts/analytics/consent";
import { loadStylesheet } from "@/scripts/utils/thirdPartyLoader";

const BANNER_HIDE_DELAY_MS = 320;
const MODAL_HIDE_DELAY_MS = 220;

const boundElements = new WeakSet<Element>();
let consentModeInitialized = false;
let pageLoadListenerAttached = false;
let stylesPromise: Promise<void> | null = null;

function ensureStylesLoaded(): Promise<void> {
  if (!stylesPromise) {
    stylesPromise = loadStylesheet(
      "/styles/cookie-consent.css",
      "cookie-consent-style",
    );
  }

  return stylesPromise;
}

function showBanner(banner: HTMLElement): void {
  banner.removeAttribute("hidden");
  requestAnimationFrame(() => {
    banner.classList.add("show");
  });
}

function hideBanner(banner: HTMLElement): void {
  banner.classList.remove("show");
  window.setTimeout(() => {
    banner.setAttribute("hidden", "");
  }, BANNER_HIDE_DELAY_MS);
}

function showModal(modal: HTMLElement): void {
  modal.removeAttribute("hidden");
  requestAnimationFrame(() => {
    modal.classList.add("show");
  });
}

function hideModal(modal: HTMLElement): void {
  modal.classList.remove("show");
  window.setTimeout(() => {
    modal.setAttribute("hidden", "");
  }, MODAL_HIDE_DELAY_MS);
}

function hideConsentUI(banner: HTMLElement, modal: HTMLElement): void {
  hideBanner(banner);
  hideModal(modal);
}

function buildPreferencesFromInputs(): ConsentPreferences {
  return {
    necessary: true,
    analytics:
      (
        document.querySelector(
          '[data-category="analytics"]',
        ) as HTMLInputElement | null
      )?.checked ?? false,
    marketing:
      (
        document.querySelector(
          '[data-category="marketing"]',
        ) as HTMLInputElement | null
      )?.checked ?? false,
    preferences:
      (
        document.querySelector(
          '[data-category="preferences"]',
        ) as HTMLInputElement | null
      )?.checked ?? false,
  };
}

function syncInputsWithStoredPreferences(): void {
  const consent = getStoredConsent();
  if (!consent) return;

  const analyticsInput = document.querySelector(
    '[data-category="analytics"]',
  ) as HTMLInputElement | null;
  const marketingInput = document.querySelector(
    '[data-category="marketing"]',
  ) as HTMLInputElement | null;
  const preferencesInput = document.querySelector(
    '[data-category="preferences"]',
  ) as HTMLInputElement | null;

  if (analyticsInput) analyticsInput.checked = consent.analytics;
  if (marketingInput) marketingInput.checked = consent.marketing;
  if (preferencesInput) preferencesInput.checked = consent.preferences;
}

function bindClick(
  elements: NodeListOf<Element>,
  handler: (event: Event) => void,
): void {
  elements.forEach((element) => {
    if (boundElements.has(element)) return;

    element.addEventListener("click", handler);
    boundElements.add(element);
  });
}

async function setupCookieConsent(): Promise<void> {
  await ensureStylesLoaded();

  const banner = document.querySelector(
    "[data-consent-banner]",
  ) as HTMLElement | null;
  const modal = document.querySelector(
    "[data-consent-modal]",
  ) as HTMLElement | null;

  if (!banner || !modal) return;

  syncInputsWithStoredPreferences();

  if (!hasConsentChoice() && !banner.classList.contains("show")) {
    window.setTimeout(() => {
      showBanner(banner);
    }, 1000);
  }

  bindClick(document.querySelectorAll('[data-action="accept"]'), () => {
    acceptAllConsent();
    hideConsentUI(banner, modal);
  });

  bindClick(
    document.querySelectorAll(
      '[data-action="reject"], [data-action="reject-modal"]',
    ),
    () => {
      rejectAllConsent();
      hideConsentUI(banner, modal);
    },
  );

  bindClick(document.querySelectorAll('[data-action="manage"]'), () => {
    hideBanner(banner);
    showModal(modal);
  });

  bindClick(document.querySelectorAll("[data-close-modal]"), () => {
    hideModal(modal);
  });

  bindClick(document.querySelectorAll('[data-action="save-preferences"]'), () => {
    updateConsent(buildPreferencesFromInputs());
    hideModal(modal);
  });
}

export function initCookieConsent(): void {
  if (!consentModeInitialized) {
    initConsentMode();
    consentModeInitialized = true;
  }

  void setupCookieConsent();

  if (!pageLoadListenerAttached) {
    document.addEventListener("astro:page-load", () => {
      void setupCookieConsent();
    });
    pageLoadListenerAttached = true;
  }
}
