import { trackEvent } from './ga4';
import { logger } from '@/lib/logger';

interface ClickData {
  x: number;
  y: number;
  timestamp: number;
  element: HTMLElement;
}

interface EngagementMetrics {
  activeTime: number;
  idleTime: number;
  visibleTime: number;
  hiddenTime: number;
  scrollDepth: number;
  maxScrollDepth: number;
}

export class AdvancedEngagementTracker {
  private clicks: Map<HTMLElement, ClickData[]> = new Map();
  private engagementStart: number = Date.now();
  private lastActivityTime: number = Date.now();
  private isPageVisible: boolean = true;
  private visibilityStartTime: number = Date.now();

  private metrics: EngagementMetrics = {
    activeTime: 0,
    idleTime: 0,
    visibleTime: 0,
    hiddenTime: 0,
    scrollDepth: 0,
    maxScrollDepth: 0,
  };

  private cleanupFunctions: Array<() => void> = [];
  private activityCheckInterval: number | null = null;

  constructor() {
    this.initTracking();
  }

  private initTracking(): void {
    if (typeof window === 'undefined') return;

    this.initRageClickDetection();
    this.initDeadClickDetection();
    this.initVisibilityTracking();
    this.initEngagementTimer();
  }

  private initRageClickDetection(): void {
    const RAGE_CLICK_THRESHOLD = 3;
    const RAGE_CLICK_WINDOW_MS = 1000;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const clickData: ClickData = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        element: target,
      };

      const elementClicks = this.clicks.get(target) || [];
      elementClicks.push(clickData);

      const recentClicks = elementClicks.filter(
        click => Date.now() - click.timestamp < RAGE_CLICK_WINDOW_MS
      );

      this.clicks.set(target, recentClicks);

      if (recentClicks.length >= RAGE_CLICK_THRESHOLD) {
        const selector = this.getElementSelector(target);

        trackEvent('rage_click', {
          element_selector: selector,
          element_text: target.textContent?.substring(0, 50) || '',
          click_count: recentClicks.length,
          element_type: target.tagName.toLowerCase(),
        });

        logger.warn('[Engagement] Rage click detected:', selector);
        this.clicks.delete(target);
      }

      this.updateActivity();
    };

    document.addEventListener('click', handleClick, { passive: true });
    this.cleanupFunctions.push(() => document.removeEventListener('click', handleClick));
  }

  private initDeadClickDetection(): void {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
      const hasClickHandler = target.onclick !== null ||
                             target.getAttribute('onclick') !== null ||
                             target.hasAttribute('data-action');

      const hasRole = target.hasAttribute('role');
      const isClickable = target.style.cursor === 'pointer' ||
                         window.getComputedStyle(target).cursor === 'pointer';

      if (!isInteractive && !hasClickHandler && !hasRole && !isClickable) {
        const selector = this.getElementSelector(target);

        trackEvent('dead_click', {
          element_selector: selector,
          element_text: target.textContent?.substring(0, 50) || '',
          element_type: tagName,
        });

        logger.warn('[Engagement] Dead click detected:', selector);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    this.cleanupFunctions.push(() => document.removeEventListener('click', handleClick));
  }

  private initVisibilityTracking(): void {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeDelta = now - this.visibilityStartTime;

      if (document.hidden) {
        this.metrics.visibleTime += timeDelta;
        this.isPageVisible = false;

        trackEvent('page_visibility_change', {
          visibility_state: 'hidden',
          time_visible: Math.round(timeDelta / 1000),
        });
      } else {
        this.metrics.hiddenTime += timeDelta;
        this.isPageVisible = true;

        trackEvent('page_visibility_change', {
          visibility_state: 'visible',
          time_hidden: Math.round(timeDelta / 1000),
        });
      }

      this.visibilityStartTime = now;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.cleanupFunctions.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
  }

  private initEngagementTimer(): void {
    const IDLE_THRESHOLD_MS = 5000;
    const CHECK_INTERVAL_MS = 1000;

    this.activityCheckInterval = window.setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - this.lastActivityTime;

      if (this.isPageVisible) {
        if (timeSinceActivity < IDLE_THRESHOLD_MS) {
          this.metrics.activeTime += CHECK_INTERVAL_MS;
        } else {
          this.metrics.idleTime += CHECK_INTERVAL_MS;
        }
      }
    }, CHECK_INTERVAL_MS);

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (classes) return `.${classes}`;
    }

    const tagName = element.tagName.toLowerCase();
    const parent = element.parentElement;

    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      if (index !== -1) {
        return `${tagName}:nth-child(${index + 1})`;
      }
    }

    return tagName;
  }

  public getEngagementMetrics(): EngagementMetrics {
    return { ...this.metrics };
  }

  public sendEngagementSummary(): void {
    const totalTime = Date.now() - this.engagementStart;
    const engagementRate = totalTime > 0
      ? Math.round((this.metrics.activeTime / totalTime) * 100)
      : 0;

    trackEvent('page_engagement_summary', {
      total_time: Math.round(totalTime / 1000),
      active_time: Math.round(this.metrics.activeTime / 1000),
      idle_time: Math.round(this.metrics.idleTime / 1000),
      visible_time: Math.round(this.metrics.visibleTime / 1000),
      hidden_time: Math.round(this.metrics.hiddenTime / 1000),
      engagement_rate: engagementRate,
      max_scroll_depth: this.metrics.maxScrollDepth,
    });
  }

  public destroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }
    this.sendEngagementSummary();
  }
}

export function initAdvancedEngagement(): AdvancedEngagementTracker {
  const tracker = new AdvancedEngagementTracker();

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      tracker.sendEngagementSummary();
    });
  }

  return tracker;
}
