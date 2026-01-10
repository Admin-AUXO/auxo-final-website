/**
 * Core Web Vitals Tracking for GA4
 * Tracks performance metrics: LCP, FID, CLS, INP, FCP, TTFB
 * @see https://web.dev/vitals/
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './ga4';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Get rating based on metric thresholds (2026 standards)
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric;

  // Updated thresholds for 2026
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send web vital metric to GA4
 */
function sendToGA4(metric: Metric): void {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: getRating(metric),
    delta: Math.round(metric.delta),
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Send to GA4 with recommended event structure
  trackEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: webVitalMetric.value,
    metric_id: metric.id,
    metric_value: webVitalMetric.value,
    metric_delta: webVitalMetric.delta,
    metric_rating: webVitalMetric.rating,
    metric_name: metric.name,
    navigation_type: metric.navigationType,
    non_interaction: true, // Don't affect bounce rate
  });

  // Also send to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'core_web_vitals',
      web_vitals: webVitalMetric,
    });
  }
}

/**
 * Initialize Core Web Vitals tracking
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  try {
    // Track all Core Web Vitals
    onCLS(sendToGA4);
    onFCP(sendToGA4);
    onINP(sendToGA4);
    onLCP(sendToGA4);
    onTTFB(sendToGA4);

    // Track page load time
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
          const tcpTime = perfData.connectEnd - perfData.connectStart;

          trackEvent('page_performance', {
            event_category: 'Performance',
            page_load_time: Math.round(pageLoadTime),
            dom_ready_time: Math.round(domReadyTime),
            dns_time: Math.round(dnsTime),
            tcp_time: Math.round(tcpTime),
            non_interaction: true,
          });
        }, 0);
      });
    }

    // Track long tasks (performance bottlenecks)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Long task threshold
              trackEvent('long_task', {
                event_category: 'Performance',
                task_duration: Math.round(entry.duration),
                task_name: entry.name,
                non_interaction: true,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver may not be fully supported
        console.debug('Long task monitoring not supported');
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Web Vitals tracking error:', error);
    }
  }
}

/**
 * Track custom performance marks
 */
export function trackPerformanceMark(markName: string): void {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    window.performance.mark(markName);

    trackEvent('performance_mark', {
      event_category: 'Performance',
      event_label: markName,
      non_interaction: true,
    });
  } catch (error) {
    console.debug('Performance mark error:', error);
  }
}

/**
 * Track custom performance measure
 */
export function trackPerformanceMeasure(
  measureName: string,
  startMark: string,
  endMark: string
): void {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    const measure = window.performance.measure(measureName, startMark, endMark);

    trackEvent('performance_measure', {
      event_category: 'Performance',
      event_label: measureName,
      value: Math.round(measure.duration),
      measure_duration: Math.round(measure.duration),
      non_interaction: true,
    });
  } catch (error) {
    console.debug('Performance measure error:', error);
  }
}

/**
 * Get current page performance metrics
 */
export function getPerformanceMetrics(): Record<string, number> | null {
  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = timing.navigationStart;

  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    dom: timing.domComplete - timing.domLoading,
    load: timing.loadEventEnd - timing.loadEventStart,
    total: timing.loadEventEnd - navigation,
  };
}
