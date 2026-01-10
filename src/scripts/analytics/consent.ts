import { logger } from '@/lib/logger';

export interface ConsentState {
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
}

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_STORAGE_KEY = 'auxo_consent_preferences';
const CONSENT_VERSION = 1;

export function initConsentMode(defaultConsent: Partial<ConsentState> = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }

  const defaults: ConsentState = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    ...defaultConsent,
  };

  gtag('consent', 'default', {
    ...defaults,
    wait_for_update: 500,
    region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH'],
  });

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
    region: ['US', 'CA', 'AU', 'NZ', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  });

  const savedConsent = getStoredConsent();
  if (savedConsent) {
    updateConsent(savedConsent, false);
  }
}

export function updateConsent(preferences: ConsentPreferences, fireEvents: boolean = true): void {
  if (typeof window === 'undefined') return;

  const consentState: ConsentState = {
    functionality_storage: 'granted',
    security_storage: 'granted',
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    personalization_storage: preferences.preferences ? 'granted' : 'denied',
  };

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', consentState);
  }

  storeConsent(preferences);

  if (fireEvents) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_update',
      ...consentState,
    });

    window.dataLayer.push({
      event: 'consent_preferences_updated',
      consent_preferences: preferences,
    });
  }
}

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed.preferences as ConsentPreferences;
  } catch (error) {
    logger.error('Error reading consent preferences:', error);
    return null;
  }
}

function storeConsent(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      version: CONSENT_VERSION,
      preferences,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error('Error storing consent preferences:', error);
  }
}

export function acceptAllConsent(): void {
  updateConsent({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

export function rejectAllConsent(): void {
  updateConsent({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
}

export function clearConsent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing consent:', error);
  }
}

export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null;
}

export function getConsentUrlParameters(): string {
  const consent = getStoredConsent();
  if (!consent) return '';

  return new URLSearchParams({
    gcs: [
      consent.analytics ? 'G100' : 'G000',
      consent.marketing ? 'G100' : 'G000',
    ].join(','),
  }).toString();
}
