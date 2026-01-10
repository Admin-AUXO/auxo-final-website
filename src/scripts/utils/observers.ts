import { logger } from '@/lib/logger';

export interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export interface ThemeChangeCallback {
  (isDark: boolean, wasDark: boolean): void;
}

let themeObserverInstance: MutationObserver | null = null;
const themeCallbacks = new Set<ThemeChangeCallback>();

function getCurrentTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function initThemeObserver(): void {
  if (themeObserverInstance) return;

  let lastTheme: 'dark' | 'light' = getCurrentTheme();

  themeObserverInstance = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const currentTheme = getCurrentTheme();
        if (lastTheme !== currentTheme) {
          const wasDark = lastTheme === 'dark';
          const isDark = currentTheme === 'dark';
          
          themeCallbacks.forEach(callback => {
            try {
              callback(isDark, wasDark);
            } catch (error) {
              logger.error('Theme observer failed:', error);
            }
          });
          
          lastTheme = currentTheme;
        }
      }
    }
  });

  themeObserverInstance.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function observeThemeChange(callback: ThemeChangeCallback): () => void {
  initThemeObserver();
  themeCallbacks.add(callback);
  
  return () => {
    themeCallbacks.delete(callback);
    if (themeCallbacks.size === 0 && themeObserverInstance) {
      themeObserverInstance.disconnect();
      themeObserverInstance = null;
    }
  };
}

export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverOptions = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: options.root || null,
    rootMargin: options.rootMargin || '0px',
    threshold: options.threshold || 0,
  });
}

export function observeOnce(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {}
): () => void {
  const observer = createIntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        callback(entry);
        observer?.unobserve(element);
        observer?.disconnect();
      }
    }
  }, options);

  if (!observer) {
    callback({} as IntersectionObserverEntry);
    return () => {};
  }

  observer.observe(element);
  
  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

export function observeMultiple(
  elements: NodeListOf<Element> | Element[],
  callback: (entry: IntersectionObserverEntry, element: Element) => void,
  options: IntersectionObserverOptions = {}
): () => void {
  const observer = createIntersectionObserver((entries) => {
    for (const entry of entries) {
      callback(entry, entry.target);
    }
  }, options);

  if (!observer) {
    const elementArray = Array.from(elements);
    elementArray.forEach((el) => {
      const fakeEntry = {
        target: el,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: new DOMRect(), // Empty rect to avoid triggering reflows
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry;
      callback(fakeEntry, el);
    });
    return () => {};
  }

  const elementArray = Array.from(elements);
  elementArray.forEach((el) => observer.observe(el));
  
  return () => {
    elementArray.forEach((el) => observer.unobserve(el));
    observer.disconnect();
  };
}
