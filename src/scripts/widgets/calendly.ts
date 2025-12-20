interface CalendlyWindow extends Window {
  Calendly?: {
    initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
  };
}

const WIDGET_ID = 'calendly-widget';
const CALENDLY_URL = 'https://calendly.com/admin-auxodata/30min';
const SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const SCROLLBAR_FIX_DURATION = 5000;
const THEME_CHANGE_DELAY = 300;

let isInitialized = false;
let isScriptLoading = false;
let intersectionObserver: IntersectionObserver | null = null;
let themeChangeTimeout: number | null = null;
let lastTheme: string | null = null;
let resizeObserver: ResizeObserver | null = null;

function getCssVar(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getCalendlyUrl(): string {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark') || (!html.classList.contains('light') && !html.classList.contains('dark'));
  
  const accentGreen = getCssVar('--accent-green', '#A3E635').replace('#', '');
  const bgPrimary = getCssVar('--bg-primary', isDark ? '#000000' : '#FFFFFF').replace('#', '');
  const textPrimary = getCssVar('--text-primary', isDark ? '#FFFFFF' : '#000000').replace('#', '');
    
  return `${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=${accentGreen}&background_color=${bgPrimary}&text_color=${textPrimary}`;
}

function ensureThemeReady(): void {
  const html = document.documentElement;
  if (!html.classList.contains('dark') && !html.classList.contains('light')) {
    html.classList.add('dark');
  }
}

function waitForThemeAndCssVars(callback: () => void): void {
  ensureThemeReady();
  
  const checkReady = (): boolean => {
    const html = document.documentElement;
    const hasTheme = html.classList.contains('dark') || html.classList.contains('light');
    if (!hasTheme) return false;
    
    const computedStyle = getComputedStyle(html);
    const bgPrimary = computedStyle.getPropertyValue('--bg-primary').trim();
    const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
    const accentGreen = computedStyle.getPropertyValue('--accent-green').trim();
    
    return !!(bgPrimary && textPrimary && accentGreen);
  };
  
  if (checkReady()) {
    requestAnimationFrame(() => requestAnimationFrame(callback));
    return;
  }
  
  let attempts = 0;
  const maxAttempts = 50;
  const checkInterval = setInterval(() => {
    attempts++;
    if (checkReady() || attempts >= maxAttempts) {
      clearInterval(checkInterval);
      requestAnimationFrame(() => requestAnimationFrame(callback));
    }
  }, 50);
  
  const observer = new MutationObserver(() => {
    if (checkReady()) {
      observer.disconnect();
      clearInterval(checkInterval);
      requestAnimationFrame(() => requestAnimationFrame(callback));
    }
  });
  observer.observe(document.documentElement, { 
    attributes: true, 
    attributeFilter: ['class']
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (checkReady()) {
        observer.disconnect();
        clearInterval(checkInterval);
        requestAnimationFrame(() => requestAnimationFrame(callback));
      }
    }, { once: true });
  }
}

function loadCalendlyScript(callback: () => void): void {
  const win = window as CalendlyWindow;
  if (win.Calendly) {
    callback();
    return;
  }

  if (isScriptLoading) {
    const check = setInterval(() => {
      if (win.Calendly) {
        clearInterval(check);
        callback();
      }
    }, 100);
    setTimeout(() => clearInterval(check), 10000);
    return;
  }

  isScriptLoading = true;
  const script = document.createElement('script');
  script.src = SCRIPT_URL;
  script.async = true;
  script.onload = () => {
    isScriptLoading = false;
    setTimeout(callback, 100);
  };
  script.onerror = () => {
    isScriptLoading = false;
  };
  document.body.appendChild(script);
}

function hideScrollbars(element: HTMLElement): void {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
  element.style.setProperty('overflow', 'hidden', 'important');
  element.style.setProperty('overflow-x', 'hidden', 'important');
  element.style.setProperty('overflow-y', 'hidden', 'important');
  element.style.setProperty('scrollbar-width', 'none', 'important');
  element.style.setProperty('-ms-overflow-style', 'none', 'important');
}

function applyScrollbarFixRecursive(element: HTMLElement): void {
  hideScrollbars(element);
  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      applyScrollbarFixRecursive(child);
    }
  });
}

function applyScrollbarFix(): void {
  const widget = document.getElementById(WIDGET_ID);
  if (!widget) return;

  const container = widget.closest('.calendly-inline-widget-container') as HTMLElement;
  if (container) {
    applyScrollbarFixRecursive(container);
  }

  applyScrollbarFixRecursive(widget);
}

function calculateContainerHeight(contentHeight: number, container: HTMLElement): number {
  const padding = 20;
  const minHeight = 700;
  const newHeight = Math.max(contentHeight + padding, minHeight);
  const maxHeightValue = getComputedStyle(container).maxHeight;
  const maxHeight = maxHeightValue === 'none' ? Infinity : parseInt(maxHeightValue, 10);
  return Math.min(newHeight, maxHeight || Infinity);
}

function updateContainerHeight(height: number): void {
  const widget = document.getElementById(WIDGET_ID);
  const container = widget?.closest('.calendly-inline-widget-container') as HTMLElement;
  
  if (container && height > 0) {
    const finalHeight = calculateContainerHeight(height, container);
    container.style.height = `${finalHeight}px`;
    applyScrollbarFix();
  }
}

function handleCalendlyResize(event: MessageEvent): void {
  const allowedOrigins = ['https://calendly.com', 'https://assets.calendly.com'];
  if (!allowedOrigins.includes(event.origin)) return;
  if (event.data?.event === 'calendly.event_height' && event.data.height) {
    updateContainerHeight(event.data.height);
  }
}

function setupResizeListener(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('message', handleCalendlyResize);
  
  const widget = document.getElementById(WIDGET_ID);
  if (!widget || typeof ResizeObserver === 'undefined') return;
  
  const iframe = widget.querySelector('iframe');
  if (iframe) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          updateContainerHeight(entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(iframe);
  }
}

function initWidget(forceReinit = false): void {
  const widget = document.getElementById(WIDGET_ID);
  if (!widget) return;

  const win = window as CalendlyWindow;
  const hasContent = widget.querySelector('.calendly-inline-widget > div');

  if (!forceReinit && isInitialized && hasContent) return;
  if (hasContent && !forceReinit) {
    isInitialized = true;
    return;
  }

  if (!win.Calendly) {
    loadCalendlyScript(() => initWidget(forceReinit));
    return;
  }

  if (forceReinit) {
    widget.innerHTML = '';
    isInitialized = false;
  }

  if (!isInitialized) {
    const url = getCalendlyUrl();
    widget.setAttribute('data-url', url);
    widget.setAttribute('data-resize', 'true');
    win.Calendly.initInlineWidget({ url, parentElement: widget });
    isInitialized = true;
    
    setupResizeListener();
    
    const fixInterval = setInterval(applyScrollbarFix, 100);
    setTimeout(() => {
      clearInterval(fixInterval);
      applyScrollbarFix();
    }, SCROLLBAR_FIX_DURATION);
  }
}

function getCurrentTheme(): string {
  const html = document.documentElement;
  if (html.classList.contains('dark')) return 'dark';
  if (html.classList.contains('light')) return 'light';
  return 'dark';
}

function handleThemeChange(): void {
  const currentTheme = getCurrentTheme();
  const win = window as CalendlyWindow;
  
  if (currentTheme !== lastTheme && win.Calendly && isInitialized) {
    lastTheme = currentTheme;
    
    if (themeChangeTimeout) clearTimeout(themeChangeTimeout);
    
    themeChangeTimeout = window.setTimeout(() => {
      const widget = document.getElementById(WIDGET_ID);
      if (widget?.querySelector('.calendly-inline-widget > div')) {
        initWidget(true);
      }
    }, THEME_CHANGE_DELAY);
  } else if (!lastTheme) {
    lastTheme = currentTheme;
  }
}

export function setupCalendly(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  function initialize(): void {
    ensureThemeReady();
    lastTheme = getCurrentTheme();

    const themeObserver = new MutationObserver(handleThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const widget = document.getElementById(WIDGET_ID);
    if (!widget) {
      if (import.meta.env.DEV) console.warn('Calendly widget container not found');
      return;
    }

    if (widget.querySelector('.calendly-inline-widget > div')) {
      isInitialized = true;
      return;
    }

    const rect = widget.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100;
    
    const initWithTheme = () => {
      if (isVisible) {
        initWidget();
      } else {
        let hasInitialized = false;
        intersectionObserver = new IntersectionObserver((entries) => {
          if (entries[0]?.isIntersecting && !hasInitialized && !isInitialized) {
            hasInitialized = true;
            initWidget();
            intersectionObserver?.disconnect();
            intersectionObserver = null;
          }
        }, { rootMargin: '100px' });
        intersectionObserver.observe(widget);
      }
    };
    
    waitForThemeAndCssVars(initWithTheme);

    let currentPath = window.location.pathname;
    document.addEventListener('astro:page-load', () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath && (newPath === '/contact/' || newPath === '/contact')) {
        isInitialized = false;
        lastTheme = null;
        currentPath = newPath;
        
        if (intersectionObserver) {
          intersectionObserver.disconnect();
          intersectionObserver = null;
        }
        
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
        
        const widget = document.getElementById(WIDGET_ID);
        if (widget) {
          widget.innerHTML = '';
          waitForThemeAndCssVars(() => initWidget());
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}
