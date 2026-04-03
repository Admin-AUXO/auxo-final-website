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

const LEGACY_CONSENT_STORAGE_KEY = 'auxo_consent_preferences';
const CONSENT_VERSION = 1;
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CONSENT_COOKIE_PATH = 'Path=/; SameSite=Lax';
const CONSENT_COOKIE_KEYS = {
  choice: 'auxo_consent_choice',
  analytics: 'auxo_consent_analytics',
  marketing: 'auxo_consent_marketing',
  preferences: 'auxo_consent_preferences',
} as const;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(prefix.length));
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; ${CONSENT_COOKIE_PATH}`;
}

function persistConsentCookies(preferences: ConsentPreferences): void {
  writeCookie(CONSENT_COOKIE_KEYS.choice, '1');
  writeCookie(
    CONSENT_COOKIE_KEYS.analytics,
    preferences.analytics ? 'granted' : 'denied',
  );
  writeCookie(
    CONSENT_COOKIE_KEYS.marketing,
    preferences.marketing ? 'granted' : 'denied',
  );
  writeCookie(
    CONSENT_COOKIE_KEYS.preferences,
    preferences.preferences ? 'granted' : 'denied',
  );
}

function removeLegacyConsentStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
  } catch (error) {
    logger.error('Error removing legacy consent storage:', error);
  }
}

function migrateLegacyConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  if (readCookie(CONSENT_COOKIE_KEYS.choice)) return null;

  try {
    const stored = localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed.version !== CONSENT_VERSION || !parsed.preferences) return null;

    const preferences = parsed.preferences as ConsentPreferences;
    persistConsentCookies(preferences);
    removeLegacyConsentStorage();
    return preferences;
  } catch (error) {
    logger.error('Error migrating legacy consent preferences:', error);
    return null;
  }
}

function buildConsentState(preferences: ConsentPreferences): ConsentState {
  return {
    functionality_storage: 'granted',
    security_storage: 'granted',
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    personalization_storage: preferences.preferences ? 'granted' : 'denied',
  };
}

export function initializeConsentStorage(): void {
  if (typeof window === 'undefined') return;

  void getStoredConsent();
}

export function updateConsent(preferences: ConsentPreferences, fireEvents: boolean = true): void {
  if (typeof window === 'undefined') return;

  const consentState = buildConsentState(preferences);
  persistConsentCookies(preferences);
  removeLegacyConsentStorage();

  if (fireEvents) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'auxo_consent_state_changed',
      ...consentState,
      consent_choice: 'stored',
    });

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
    if (!readCookie(CONSENT_COOKIE_KEYS.choice)) {
      const migrated = migrateLegacyConsent();
      if (migrated) return migrated;
      return null;
    }

    return {
      necessary: true,
      analytics: readCookie(CONSENT_COOKIE_KEYS.analytics) === 'granted',
      marketing: readCookie(CONSENT_COOKIE_KEYS.marketing) === 'granted',
      preferences: readCookie(CONSENT_COOKIE_KEYS.preferences) === 'granted',
    };
  } catch (error) {
    logger.error('Error reading consent preferences:', error);
    return null;
  }
}

export function isAnalyticsConsentGranted(): boolean {
  return getStoredConsent()?.analytics === true;
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

export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null;
}
