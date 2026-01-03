interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type ReportCallback = (metric: Metric) => void;

const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function generateId(): string {
  return `v3-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function reportMetric(name: string, value: number, callback: ReportCallback): void {
  const metric: Metric = {
    name,
    value,
    rating: getRating(name, value),
    delta: value,
    id: generateId(),
  };
  callback(metric);
}

export function onLCP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const value = lastEntry.renderTime || lastEntry.loadTime || 0;
      reportMetric('LCP', value, callback);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
  }
}

export function onFID(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
        const value = entry.processingStart ? entry.processingStart - entry.startTime : 0;
        reportMetric('FID', value, callback);
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
  }
}

export function onCLS(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
        if (entry.hadRecentInput) return;

        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

        if (
          sessionValue &&
          entry.startTime - (lastSessionEntry?.startTime || 0) < 1000 &&
          entry.startTime - (firstSessionEntry?.startTime || 0) < 5000
        ) {
          sessionValue += entry.value || 0;
          sessionEntries.push(entry);
        } else {
          sessionValue = entry.value || 0;
          sessionEntries = [entry];
        }

        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          clsEntries = sessionEntries;
          reportMetric('CLS', clsValue, callback);
        }
      });
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
  }
}

export function onFCP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          reportMetric('FCP', entry.startTime, callback);
          observer.disconnect();
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
  }
}

export function onTTFB(callback: ReportCallback): void {
  if (!('performance' in window) || !performance.timing) return;

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      reportMetric('TTFB', ttfb, callback);
    }
  } catch (e) {
  }
}

export function onINP(callback: ReportCallback): void {
  if (!('PerformanceObserver' in window)) return;

  try {
    let longestInteraction = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { processingStart?: number; processingEnd?: number; duration?: number }) => {
        const duration = entry.duration || (entry.processingEnd && entry.processingStart
          ? entry.processingEnd - entry.startTime
          : 0);
        if (duration > longestInteraction && duration > 16) {
          longestInteraction = duration;
          reportMetric('INP', duration, callback);
        }
      });
    });

    observer.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
  } catch (e) {
  }
}

export function initWebVitals(): void {
  if (import.meta.env.DEV) {
    const logMetric = (metric: Metric) => {
      const emoji = metric.rating === 'good' ? '✓' : metric.rating === 'needs-improvement' ? '⚠' : '✗';
      console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    };

    onLCP(logMetric);
    onFID(logMetric);
    onCLS(logMetric);
    onFCP(logMetric);
    onTTFB(logMetric);
    onINP(logMetric);
  }
}
