const GA4_MEASUREMENT_ID = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID || 'G-WBMKHRWS7Z';
const GA4_DEBUG_MODE = import.meta.env.DEV || import.meta.env.PUBLIC_GA4_DEBUG === 'true';

const MAX_PARAM_LENGTH = 100;
const MAX_EVENT_NAME_LENGTH = 40;
const MAX_PARAMS_PER_EVENT = 25;

const eventDeduplication = new Map<string, number>();
const DEDUP_WINDOW_MS = 1000;

function validateEventName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  if (name.length > MAX_EVENT_NAME_LENGTH) {
    if (GA4_DEBUG_MODE) console.warn(`GA4: Event name too long: ${name} (max ${MAX_EVENT_NAME_LENGTH})`);
    return false;
  }
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    if (GA4_DEBUG_MODE) console.warn(`GA4: Invalid event name format: ${name} (must be snake_case)`);
    return false;
  }
  return true;
}

function sanitizeParamValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') {
    const sanitized = value.slice(0, MAX_PARAM_LENGTH);
    if (sanitized !== value && GA4_DEBUG_MODE) {
      console.warn(`GA4: Parameter value truncated from ${value.length} to ${MAX_PARAM_LENGTH} chars`);
    }
    return sanitized;
  }
  return String(value).slice(0, MAX_PARAM_LENGTH);
}

function sanitizeParams(
  params?: Record<string, string | number | boolean | unknown[] | Record<string, unknown>>
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;

  const sanitized: Record<string, string | number | boolean> = {};
  let paramCount = 0;

  for (const [key, value] of Object.entries(params)) {
    if (paramCount >= MAX_PARAMS_PER_EVENT) {
      if (GA4_DEBUG_MODE) console.warn(`GA4: Too many parameters, truncating at ${MAX_PARAMS_PER_EVENT}`);
      break;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      if (GA4_DEBUG_MODE) console.warn(`GA4: Invalid parameter name: ${key} (must be snake_case)`);
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = JSON.stringify(value).slice(0, MAX_PARAM_LENGTH);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = JSON.stringify(value).slice(0, MAX_PARAM_LENGTH);
    } else {
      const sanitizedValue = sanitizeParamValue(value);
      if (sanitizedValue !== null) {
        sanitized[key] = sanitizedValue;
      }
    }
    paramCount++;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function checkConsent(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consentPrefs = localStorage.getItem('auxo_consent_preferences');
    if (!consentPrefs) return false;
    
    const prefs = JSON.parse(consentPrefs);
    return prefs.preferences?.analytics === true;
  } catch {
    return false;
  }
}

function isDuplicateEvent(eventName: string, params?: Record<string, unknown>): boolean {
  const now = Date.now();
  const eventKey = `${eventName}_${JSON.stringify(params || {})}`;
  const lastSent = eventDeduplication.get(eventKey);
  
  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    return true;
  }
  
  eventDeduplication.set(eventKey, now);
  
  if (eventDeduplication.size > 1000) {
    const oldestKey = eventDeduplication.keys().next().value;
    if (oldestKey) {
      eventDeduplication.delete(oldestKey);
    }
  }
  
  return false;
}

export function isGA4Available(): boolean {
  if (typeof window === 'undefined') return false;
  
  if (!checkConsent()) {
    if (GA4_DEBUG_MODE) console.debug('GA4: Analytics consent not granted');
    return false;
  }
  
  return (
    typeof window.gtag === 'function' ||
    Array.isArray(window.dataLayer)
  );
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | unknown[] | Record<string, unknown>>
): void {
  if (!validateEventName(eventName)) return;
  if (!isGA4Available()) return;

  const sanitizedParams = sanitizeParams(params);
  
  if (isDuplicateEvent(eventName, sanitizedParams)) {
    if (GA4_DEBUG_MODE) console.debug(`GA4: Duplicate event suppressed: ${eventName}`);
    return;
  }

  try {
    const eventParams = {
      ...sanitizedParams,
      ...(GA4_DEBUG_MODE && { debug_mode: true }),
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
      if (GA4_DEBUG_MODE) {
        console.log(`GA4 Event: ${eventName}`, eventParams);
      }
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
      if (GA4_DEBUG_MODE) {
        console.log(`GA4 DataLayer: ${eventName}`, eventParams);
      }
    }
  } catch (error) {
    if (GA4_DEBUG_MODE) {
      console.error('GA4 tracking error:', error, { eventName, params });
    }
  }
}

export function trackPageView(
  path: string,
  title?: string,
  params?: Record<string, string | number | boolean>
): void {
  trackEvent('page_view', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    ...params,
  });
}

export function trackFormSubmission(formData: {
  formName: string;
  formLocation: string;
  formType?: string;
}): void {
  trackEvent('generate_lead', {
    form_name: formData.formName,
    form_location: formData.formLocation,
    form_type: formData.formType || 'contact',
    value: 1,
    currency: 'USD',
    engagement_time_msec: 0,
  });
}

export function trackCalendarBooking(params: {
  location: string;
  buttonText?: string;
  context?: string;
}): void {
  trackEvent('schedule_meeting', {
    event_category: 'engagement',
    event_label: params.buttonText || 'Schedule Meeting',
    location: params.location,
    context: params.context || 'unknown',
    value: 5,
  });
}

export function trackCTAClick(params: {
  ctaText: string;
  ctaLocation: string;
  ctaDestination?: string;
  ctaType?: string;
}): void {
  trackEvent('cta_click', {
    cta_text: params.ctaText,
    cta_location: params.ctaLocation,
    cta_destination: params.ctaDestination || '',
    cta_type: params.ctaType || 'button',
    link_url: params.ctaDestination || '',
  });
}

export function trackNavigation(params: {
  linkText: string;
  linkUrl: string;
  linkLocation: 'header' | 'footer' | 'mobile_menu' | 'dropdown';
  isExternal?: boolean;
}): void {
  trackEvent('navigation_click', {
    link_text: params.linkText,
    link_url: params.linkUrl,
    link_location: params.linkLocation,
    link_type: params.isExternal ? 'external' : 'internal',
  });
}

export function trackOutboundLink(params: {
  url: string;
  text?: string;
  location?: string;
}): void {
  trackEvent('click', {
    link_url: params.url,
    link_text: params.text || params.url,
    link_location: params.location || 'unknown',
    outbound: true,
  });
}

export function trackFileDownload(params: {
  fileName: string;
  fileType: string;
  fileUrl: string;
  location?: string;
}): void {
  trackEvent('file_download', {
    file_name: params.fileName,
    file_extension: params.fileType,
    file_url: params.fileUrl,
    link_url: params.fileUrl,
    link_location: params.location || 'unknown',
  });
}

export function trackScrollDepth(depth: 25 | 50 | 75 | 90 | 100): void {
  trackEvent('scroll', {
    engagement_time_msec: 0,
    percent_scrolled: depth,
  });
}

export function trackEngagement(params: {
  engagementType: string;
  engagementTime?: number;
  value?: number;
}): void {
  const eventParams: Record<string, string | number | boolean | unknown[] | Record<string, unknown>> = {
    engagement_type: params.engagementType,
    value: params.value || 1,
  };
  
  if (params.engagementTime !== undefined) {
    eventParams.engagement_time_msec = params.engagementTime;
  }
  
  trackEvent('user_engagement', eventParams);
}

export function trackSearch(searchTerm: string, location?: string): void {
  trackEvent('search', {
    search_term: searchTerm,
    search_location: location || 'unknown',
    engagement_time_msec: 0,
  });
}

export function trackThemeChange(theme: 'light' | 'dark'): void {
  trackEvent('theme_change', {
    theme: theme,
    engagement_time_msec: 0,
  });
}

export function trackServiceView(service: {
  id: string;
  name: string;
  category: string;
  price?: number;
}): void {
  trackEvent('view_item', {
    currency: 'USD',
    value: service.price || 0,
    items: [{
      item_id: service.id,
      item_name: service.name,
      item_category: service.category,
      item_category2: 'services',
      price: service.price || 0,
      quantity: 1,
    }],
  });
}

export function trackServiceCategoryView(category: string): void {
  trackEvent('view_item_list', {
    item_list_id: category,
    item_list_name: category,
  });
}

export function trackFormStart(formName: string, location: string): void {
  trackEvent('form_start', {
    event_category: 'forms',
    event_label: formName,
    form_name: formName,
    form_location: location,
  });
}

export function trackFormAbandonment(formName: string, fieldsFilled: number): void {
  trackEvent('form_abandonment', {
    form_name: formName,
    fields_completed: fieldsFilled,
    engagement_time_msec: 0,
  });
}

export function trackVideo(params: {
  action: 'play' | 'pause' | 'complete' | 'progress';
  videoTitle: string;
  videoUrl?: string;
  percentage?: number;
}): void {
  trackEvent('video_' + params.action, {
    event_category: 'video',
    event_label: params.videoTitle,
    video_title: params.videoTitle,
    video_url: params.videoUrl || '',
    video_percent: params.percentage || 0,
  });
}

export function trackError(params: {
  errorMessage: string;
  errorType: string;
  fatal?: boolean;
  location?: string;
}): void {
  trackEvent('exception', {
    description: params.errorMessage.substring(0, MAX_PARAM_LENGTH),
    fatal: params.fatal || false,
    error_type: params.errorType,
    page_location: params.location || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
  });
}

export function trackTiming(params: {
  name: string;
  value: number;
  category?: string;
  label?: string;
}): void {
  trackEvent('timing_complete', {
    name: params.name,
    value: params.value,
    event_category: params.category || 'performance',
    event_label: params.label || params.name,
  });
}

export function initScrollDepthTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const scrollDepths = [25, 50, 75, 90, 100];
  const triggered = new Set<number>();

  const handleScroll = () => {
    const scrollPercent = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    for (const depth of scrollDepths) {
      if (scrollPercent >= depth && !triggered.has(depth)) {
        triggered.add(depth);
        trackScrollDepth(depth as 25 | 50 | 75 | 90 | 100);
      }
    }
  };

  let ticking = false;
  const throttledScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', throttledScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', throttledScroll);
  };
}

export function initOutboundLinkTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href) return;

    const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);

    if (isExternal) {
      trackOutboundLink({
        url: href,
        text: target.textContent?.trim() || href,
        location: target.closest('[data-location]')?.getAttribute('data-location') || 'unknown',
      });
    }
  };

  document.addEventListener('click', handleClick, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
  };
}

export function setUserProperties(properties: Record<string, string | number | boolean>): void {
  if (!isGA4Available() || !checkConsent()) return;

  const sanitized = sanitizeParams(properties as Record<string, string | number | boolean | unknown[] | Record<string, unknown>>);
  if (!sanitized || Object.keys(sanitized).length === 0) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', sanitized);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'set_user_properties',
        user_properties: sanitized,
      });
    }

    if (GA4_DEBUG_MODE) {
      console.log('[GA4] User properties set:', sanitized);
    }
  } catch (error) {
    if (GA4_DEBUG_MODE) {
      console.warn('[GA4] User properties error:', error);
    }
  }
}

export function initGA4Tracking(): () => void {
  const cleanupFunctions: Array<() => void> = [];

  cleanupFunctions.push(initScrollDepthTracking());
  cleanupFunctions.push(initOutboundLinkTracking());

  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}
