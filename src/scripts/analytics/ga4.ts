export function isGA4Available(): boolean {
  return typeof window !== 'undefined' && (
    typeof window.gtag === 'function' ||
    Array.isArray(window.dataLayer)
  );
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | unknown[] | Record<string, unknown>>
): void {
  if (!isGA4Available()) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('GA4 tracking error:', error);
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
    page_title: title || document.title,
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
    event_category: 'engagement',
    event_label: params.ctaText,
    cta_location: params.ctaLocation,
    cta_destination: params.ctaDestination || '',
    cta_type: params.ctaType || 'button',
  });
}

export function trackNavigation(params: {
  linkText: string;
  linkUrl: string;
  linkLocation: 'header' | 'footer' | 'mobile_menu' | 'dropdown';
  isExternal?: boolean;
}): void {
  trackEvent('navigation_click', {
    event_category: 'navigation',
    event_label: params.linkText,
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
    event_category: 'outbound',
    event_label: params.text || params.url,
    outbound_url: params.url,
    link_location: params.location || 'unknown',
  });
}

export function trackFileDownload(params: {
  fileName: string;
  fileType: string;
  fileUrl: string;
  location?: string;
}): void {
  trackEvent('file_download', {
    event_category: 'downloads',
    event_label: params.fileName,
    file_name: params.fileName,
    file_type: params.fileType,
    file_url: params.fileUrl,
    location: params.location || 'unknown',
  });
}

export function trackScrollDepth(depth: 25 | 50 | 75 | 90 | 100): void {
  trackEvent('scroll', {
    event_category: 'engagement',
    event_label: `${depth}%`,
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
  });
}

export function trackThemeChange(theme: 'light' | 'dark'): void {
  trackEvent('theme_change', {
    event_category: 'user_preferences',
    event_label: theme,
    theme: theme,
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
    event_category: 'forms',
    event_label: formName,
    form_name: formName,
    fields_completed: fieldsFilled,
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
    description: params.errorMessage,
    error_type: params.errorType,
    fatal: params.fatal || false,
    location: params.location || 'unknown',
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
  if (!isGA4Available()) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', properties);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'set_user_properties',
        user_properties: properties,
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('GA4 user properties error:', error);
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
