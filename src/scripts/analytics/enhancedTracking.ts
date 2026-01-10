import { trackEvent } from './ga4';

export function trackViewItemList(params: {
  items: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    item_category2?: string;
    item_variant?: string;
    price?: number;
    index?: number;
  }>;
  item_list_id: string;
  item_list_name: string;
}): void {
  trackEvent('view_item_list', {
    item_list_id: params.item_list_id,
    item_list_name: params.item_list_name,
    items: params.items,
  });
}

export class SessionQualityTracker {
  private startTime: number;
  private engagementTime: number = 0;
  private scrollDepth: number = 0;
  private clicks: number = 0;
  private pageViews: number = 0;
  private isActive: boolean = true;
  private lastActivityTime: number;
  private engagementInterval: number | null = null;
  private scrollTimeout: number | null = null;

  constructor() {
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.initTracking();
  }

  private initTracking(): void {
    if (typeof window === 'undefined') return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => {
      document.addEventListener(event, () => this.recordActivity(), { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
      } else {
        this.isActive = true;
        this.lastActivityTime = Date.now();
      }
    });

    document.addEventListener('click', () => {
      this.clicks++;
      if (this.clicks === 1 || this.clicks % 5 === 0) {
        this.sendSessionQuality();
      }
    });

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      const previousDepth = this.scrollDepth;
      this.scrollDepth = Math.max(this.scrollDepth, scrollPercent);
      
      if (scrollPercent >= 50 && previousDepth < 50) {
        this.sendSessionQuality();
      } else if (scrollPercent >= 90 && previousDepth < 90) {
        this.sendSessionQuality();
      }
      
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      this.scrollTimeout = window.setTimeout(() => {
        if (this.scrollDepth > 0) {
          this.sendSessionQuality();
        }
        this.scrollTimeout = null;
      }, 5000);
    }, { passive: true });

    this.engagementInterval = window.setInterval(() => {
      if (this.isActive && Date.now() - this.lastActivityTime < 5000) {
        this.engagementTime += 1000;
      }
    }, 1000);

  }

  private recordActivity(): void {
    this.lastActivityTime = Date.now();
    this.isActive = true;
  }

  public incrementPageViews(): void {
    this.pageViews++;
  }

  private getEngagementRate(): number {
    const totalTime = Date.now() - this.startTime;
    return totalTime > 0 ? Math.round((this.engagementTime / totalTime) * 100) : 0;
  }

  private getSessionQuality(): 'high' | 'medium' | 'low' {
    const engagementRate = this.getEngagementRate();
    const timeOnSite = this.engagementTime / 1000;

    if (engagementRate >= 60 && timeOnSite >= 30 && this.pageViews >= 2) {
      return 'high';
    } else if (engagementRate >= 30 || timeOnSite >= 15) {
      return 'medium';
    }
    return 'low';
  }

  public sendSessionQuality(): void {
    if (this.clicks === 0 && this.scrollDepth === 0) return;

    const sessionDuration = Math.round((Date.now() - this.startTime) / 1000);

    trackEvent('session_quality', {
      event_category: 'Engagement',
      session_duration: sessionDuration,
      engagement_time: Math.round(this.engagementTime / 1000),
      engagement_rate: this.getEngagementRate(),
      scroll_depth: this.scrollDepth,
      clicks: this.clicks,
      page_views: this.pageViews,
      session_quality: this.getSessionQuality(),
      non_interaction: true,
    });
  }

  public destroy(): void {
    if (this.engagementInterval) {
      clearInterval(this.engagementInterval);
      this.engagementInterval = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
  }
}

export function trackEngagementMilestone(milestone: string, value?: number): void {
  trackEvent('engagement_milestone', {
    event_category: 'Engagement',
    event_label: milestone,
    value: value || 1,
  });
}

export function setEnhancedUserProperties(properties: {
  user_type?: 'new' | 'returning' | 'subscriber';
  client_status?: 'prospect' | 'lead' | 'client' | 'partner';
  industry?: string;
  company_size?: string;
  region?: string;
  traffic_source?: string;
  device_category?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  language?: string;
}, fireEvent: boolean = true): void {
  if (typeof window === 'undefined') return;

  const userProps: Record<string, string | number | boolean> = {};
  const hasCustomProperties = Object.keys(properties).length > 0;

  Object.entries(properties).forEach(([key, value]) => {
    if (value !== undefined) {
      userProps[key] = value;
    }
  });

  if (!properties.device_category) {
    const width = window.innerWidth;
    if (width < 768) {
      userProps.device_category = 'mobile';
    } else if (width < 1024) {
      userProps.device_category = 'tablet';
    } else {
      userProps.device_category = 'desktop';
    }
  }

  if (!properties.browser && navigator.userAgent) {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) userProps.browser = 'Chrome';
    else if (ua.includes('Safari')) userProps.browser = 'Safari';
    else if (ua.includes('Firefox')) userProps.browser = 'Firefox';
    else if (ua.includes('Edge')) userProps.browser = 'Edge';
    else userProps.browser = 'Other';
  }

  if (!properties.language) {
    userProps.language = navigator.language || 'en';
  }

  if (window.gtag) {
    window.gtag('set', 'user_properties', userProps);
  }

  if (fireEvent && hasCustomProperties && window.dataLayer) {
    window.dataLayer.push({
      event: 'set_user_properties',
      user_properties: userProps,
    });
  }
}

export function trackCustomEvent(params: {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, string | number | boolean>;
}): void {
  const eventParams: Record<string, string | number | boolean | unknown[] | Record<string, unknown>> = {
    event_category: params.event_category || 'Custom',
  };

  if (params.event_label !== undefined) {
    eventParams.event_label = params.event_label;
  }

  if (params.value !== undefined) {
    eventParams.value = params.value;
  }

  if (params.custom_parameters) {
    Object.assign(eventParams, params.custom_parameters);
  }

  trackEvent(params.event_name, eventParams);
}

export function initEnhancedTracking(): { sessionTracker: SessionQualityTracker; cleanup: () => void } {
  const sessionTracker = new SessionQualityTracker();

  setEnhancedUserProperties({});

  const cleanup = () => {
    sessionTracker.destroy();
  };

  return { sessionTracker, cleanup };
}
