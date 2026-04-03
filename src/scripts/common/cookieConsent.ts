import {
  initializeConsentStorage,
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
const CONSENT_CATEGORIES = ["analytics", "marketing", "preferences"] as const;
type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

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

function showElement(element: HTMLElement): void {
  element.removeAttribute("hidden");
  requestAnimationFrame(() => {
    element.classList.add("show");
  });
}

function hideElement(element: HTMLElement, delay: number): void {
  element.classList.remove("show");
  window.setTimeout(() => {
    element.setAttribute("hidden", "");
  }, delay);
}

function hideConsentUI(banner: HTMLElement, modal: HTMLElement): void {
  hideElement(banner, BANNER_HIDE_DELAY_MS);
  hideElement(modal, MODAL_HIDE_DELAY_MS);
}

function getConsentInput(
  category: ConsentCategory,
): HTMLInputElement | null {
  return document.querySelector(
    `[data-category="${category}"]`,
  ) as HTMLInputElement | null;
}

function buildPreferencesFromInputs(): ConsentPreferences {
  const optionalPreferences = Object.fromEntries(
    CONSENT_CATEGORIES.map((category) => [
      category,
      getConsentInput(category)?.checked ?? false,
    ]),
  ) as Omit<ConsentPreferences, "necessary">;

  return { necessary: true, ...optionalPreferences };
}

function syncInputsWithStoredPreferences(): void {
  const consent = getStoredConsent();
  if (!consent) return;

  CONSENT_CATEGORIES.forEach((category) => {
    const input = getConsentInput(category);
    if (input) {
      input.checked = consent[category];
    }
  });
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
      showElement(banner);
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
    hideElement(banner, BANNER_HIDE_DELAY_MS);
    showElement(modal);
  });

  bindClick(document.querySelectorAll("[data-close-modal]"), () => {
    hideElement(modal, MODAL_HIDE_DELAY_MS);
  });

  bindClick(document.querySelectorAll('[data-action="save-preferences"]'), () => {
    updateConsent(buildPreferencesFromInputs());
    hideElement(modal, MODAL_HIDE_DELAY_MS);
  });
}

export function initCookieConsent(): void {
  if (!consentModeInitialized) {
    initializeConsentStorage();
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
