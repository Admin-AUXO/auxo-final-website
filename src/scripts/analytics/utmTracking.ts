import { logger } from '@/lib/logger';

const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
  'msclkid',
] as const;

type UTMParam = typeof UTM_PARAMS[number];

interface UTMData {
  [key: string]: string | number;
}

interface AttributionData {
  firstTouch: UTMData & { timestamp: number };
  lastTouch: UTMData & { timestamp: number };
  sessionCount: number;
}

const STORAGE_KEYS = {
  FIRST_TOUCH: 'auxo_utm_first_touch',
  LAST_TOUCH: 'auxo_utm_last_touch',
  SESSION_COUNT: 'auxo_session_count',
  CURRENT_SESSION: 'auxo_current_session_utm',
} as const;

const SESSION_DURATION_MS = 30 * 60 * 1000;

function extractUTMFromURL(): UTMData {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmData: UTMData = {};

  UTM_PARAMS.forEach((param) => {
    const value = urlParams.get(param);
    if (value) {
      utmData[param] = value;
    }
  });

  return utmData;
}

function extractReferrerInfo(): { referrer: string; referrer_domain: string } | null {
  if (typeof document === 'undefined' || !document.referrer) return null;

  try {
    const referrerUrl = new URL(document.referrer);
    const currentHost = window.location.hostname;

    if (referrerUrl.hostname !== currentHost) {
      return {
        referrer: document.referrer,
        referrer_domain: referrerUrl.hostname,
      };
    }
  } catch {
  }

  return null;
}

function getStoredAttribution(): AttributionData | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;

  try {
    const firstTouch = localStorage.getItem(STORAGE_KEYS.FIRST_TOUCH);
    const lastTouch = localStorage.getItem(STORAGE_KEYS.LAST_TOUCH);
    const sessionCount = localStorage.getItem(STORAGE_KEYS.SESSION_COUNT);

    if (!firstTouch || !lastTouch) return null;

    return {
      firstTouch: JSON.parse(firstTouch),
      lastTouch: JSON.parse(lastTouch),
      sessionCount: parseInt(sessionCount || '0', 10),
    };
  } catch (error) {
    logger.warn('Failed to parse stored attribution data:', error);
    return null;
  }
}

function saveAttribution(attribution: AttributionData): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.FIRST_TOUCH, JSON.stringify(attribution.firstTouch));
    localStorage.setItem(STORAGE_KEYS.LAST_TOUCH, JSON.stringify(attribution.lastTouch));
    localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, attribution.sessionCount.toString());
  } catch (error) {
    logger.warn('Failed to save attribution data:', error);
  }
}

function getCurrentSessionUTM(): UTMData | null {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveCurrentSessionUTM(utmData: UTMData): void {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(utmData));
  } catch (error) {
    logger.warn('Failed to save session UTM data:', error);
  }
}

function determineTrafficSource(utmData: UTMData, referrerInfo: ReturnType<typeof extractReferrerInfo>): {
  source: string;
  medium: string;
} {
  if (utmData.utm_source && utmData.utm_medium) {
    return {
      source: String(utmData.utm_source),
      medium: String(utmData.utm_medium),
    };
  }

  if (utmData.utm_source) {
    return {
      source: String(utmData.utm_source),
      medium: utmData.utm_medium ? String(utmData.utm_medium) : 'none',
    };
  }

  if (utmData.gclid) {
    return { source: 'google', medium: 'cpc' };
  }
  if (utmData.fbclid) {
    return { source: 'facebook', medium: 'cpc' };
  }
  if (utmData.msclkid) {
    return { source: 'bing', medium: 'cpc' };
  }

  if (referrerInfo) {
    const domain = referrerInfo.referrer_domain.toLowerCase();

    if (domain.includes('google.')) return { source: 'google', medium: 'organic' };
    if (domain.includes('bing.')) return { source: 'bing', medium: 'organic' };
    if (domain.includes('yahoo.')) return { source: 'yahoo', medium: 'organic' };
    if (domain.includes('duckduckgo.')) return { source: 'duckduckgo', medium: 'organic' };
    if (domain.includes('baidu.')) return { source: 'baidu', medium: 'organic' };

    if (domain.includes('facebook.') || domain.includes('fb.')) return { source: 'facebook', medium: 'social' };
    if (domain.includes('twitter.') || domain.includes('t.co')) return { source: 'twitter', medium: 'social' };
    if (domain.includes('linkedin.')) return { source: 'linkedin', medium: 'social' };
    if (domain.includes('instagram.')) return { source: 'instagram', medium: 'social' };
    if (domain.includes('youtube.')) return { source: 'youtube', medium: 'social' };

    return { source: domain, medium: 'referral' };
  }

  return { source: '(direct)', medium: '(none)' };
}

function processAttribution(): AttributionData {
  const now = Date.now();
  const utmData = extractUTMFromURL();
  const referrerInfo = extractReferrerInfo();
  const sessionUTM = getCurrentSessionUTM();
  const hasNewUTM = Object.keys(utmData).length > 0;

  let attribution = getStoredAttribution();

  const isNewSession = !sessionUTM || hasNewUTM;

  const trafficSource = determineTrafficSource(utmData, referrerInfo);
  const currentData: UTMData = {
    ...utmData,
    ...trafficSource,
    ...(referrerInfo && !utmData.utm_source && {
      referrer: referrerInfo.referrer,
      referrer_domain: referrerInfo.referrer_domain,
    }),
  };

  if (!attribution) {
    attribution = {
      firstTouch: { ...currentData, timestamp: now },
      lastTouch: { ...currentData, timestamp: now },
      sessionCount: 1,
    };
  } else {
    const timeSinceLastTouch = now - attribution.lastTouch.timestamp;
    const isNewSessionByTime = timeSinceLastTouch > SESSION_DURATION_MS;

    if (isNewSession || isNewSessionByTime) {
      attribution = {
        ...attribution,
        lastTouch: { ...currentData, timestamp: now },
        sessionCount: attribution.sessionCount + 1,
      };
    } else {
      attribution = {
        ...attribution,
        lastTouch: { ...attribution.lastTouch, timestamp: now },
      };
    }
  }

  saveAttribution(attribution);
  saveCurrentSessionUTM(currentData);

  return attribution;
}

export function getAttributionData(): {
  firstTouch: UTMData;
  lastTouch: UTMData;
  sessionCount: number;
} {
  const attribution = processAttribution();

  const { timestamp: _ft, ...firstTouch } = attribution.firstTouch;
  const { timestamp: _lt, ...lastTouch } = attribution.lastTouch;

  return {
    firstTouch,
    lastTouch,
    sessionCount: attribution.sessionCount,
  };
}

export function pushAttributionToDataLayer(): void {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  try {
    const attribution = getAttributionData();

    const dataLayerData: Record<string, string | number> = {
      session_count: attribution.sessionCount,
    };

    Object.entries(attribution.firstTouch).forEach(([key, value]) => {
      dataLayerData[`ft_${key}`] = value;
    });

    Object.entries(attribution.lastTouch).forEach(([key, value]) => {
      dataLayerData[`lt_${key}`] = value;
    });

    Object.entries(attribution.lastTouch).forEach(([key, value]) => {
      dataLayerData[key] = value;
    });

    window.dataLayer.push({
      event: 'attribution_data_ready',
      ...dataLayerData,
    });

    logger.log('[UTM] Attribution data pushed to dataLayer:', dataLayerData);
  } catch (error) {
    logger.error('[UTM] Failed to push attribution to dataLayer:', error);
  }
}

export function getAttributionParams(): Record<string, string | number> {
  try {
    const attribution = getAttributionData();
    const params: Record<string, string | number> = {
      session_count: attribution.sessionCount,
    };

    Object.entries(attribution.lastTouch).forEach(([key, value]) => {
      params[key] = value;
    });

    if (attribution.lastTouch.utm_campaign) {
      params.campaign_name = attribution.lastTouch.utm_campaign;
    }
    if (attribution.lastTouch.utm_id) {
      params.campaign_id = attribution.lastTouch.utm_id;
    }

    return params;
  } catch (error) {
    logger.error('[UTM] Failed to get attribution params:', error);
    return {};
  }
}

export function initUTMTracking(): void {
  if (typeof window === 'undefined') return;

  try {
    processAttribution();

    setTimeout(() => {
      pushAttributionToDataLayer();
    }, 100);

    logger.log('[UTM] UTM tracking initialized');
  } catch (error) {
    logger.error('[UTM] Failed to initialize UTM tracking:', error);
  }
}

export function getCleanURL(): string {
  if (typeof window === 'undefined') return '';

  try {
    const url = new URL(window.location.href);

    UTM_PARAMS.forEach((param) => {
      url.searchParams.delete(param);
    });

    return url.toString();
  } catch {
    return window.location.href;
  }
}
