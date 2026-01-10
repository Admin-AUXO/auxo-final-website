import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from '../analytics/ga4';
import { logger } from '@/lib/logger';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric;

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

function sendToGA4(metric: Metric): void {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: getRating(metric),
    delta: Math.round(metric.delta),
    id: metric.id,
    navigationType: metric.navigationType,
  };

  const emoji = webVitalMetric.rating === 'good' ? '✓' : webVitalMetric.rating === 'needs-improvement' ? '⚠' : '✗';
  logger.log(`${emoji} ${metric.name}: ${webVitalMetric.value}${metric.name === 'CLS' ? '' : 'ms'} (${webVitalMetric.rating})`);

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
    non_interaction: true,
  });

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'core_web_vitals',
      web_vitals: webVitalMetric,
    });
  }
}

export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  let hasUserInteracted = false;
  const bufferedMetrics: Metric[] = [];
  const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart', 'mousedown'];
  
  const flushBufferedMetrics = () => {
    bufferedMetrics.forEach(metric => sendToGA4(metric));
    bufferedMetrics.length = 0;
  };
  
  const markUserInteraction = () => {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      flushBufferedMetrics();
      interactionEvents.forEach(event => {
        document.removeEventListener(event, markUserInteraction);
      });
    }
  };

  interactionEvents.forEach(event => {
    document.addEventListener(event, markUserInteraction, { once: true });
  });

  try {
    const handleMetric = (metric: Metric) => {
      if (hasUserInteracted) {
        sendToGA4(metric);
      } else {
        bufferedMetrics.push(metric);
      }
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  } catch (error) {
    logger.warn('Web Vitals tracking error:', error);
  }
}

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
    logger.debug('Performance mark error:', error);
  }
}

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
    logger.debug('Performance measure error:', error);
  }
}

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
