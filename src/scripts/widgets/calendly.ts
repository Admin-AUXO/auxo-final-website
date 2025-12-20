interface CalendlyWindow extends Window {
  Calendly?: {
    initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
  };
}

const WIDGET_ID = 'calendly-widget';
const CALENDLY_URL = 'https://calendly.com/admin-auxodata/30min';
const SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';

let isInitialized = false;
let isScriptLoading = false;
let intersectionObserver: IntersectionObserver | null = null;
let themeChangeTimeout: number | null = null;
let lastTheme: string | null = null;
let scrollbarFixInterval: number | null = null;

function getCssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function getCalendlyUrl(): string {
  const html = document.documentElement;
  const hasDark = html.classList.contains('dark');
  const hasLight = html.classList.contains('light');
  const isDark = hasDark || (!hasLight && !hasDark);
  
  const accentGreen = getCssVar('--accent-green', '#A3E635').replace('#', '');
  const bgPrimary = getCssVar('--bg-primary', isDark ? '#000000' : '#FFFFFF').replace('#', '');
  const textPrimary = getCssVar('--text-primary', isDark ? '#FFFFFF' : '#000000').replace('#', '');
    
  return `${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=${accentGreen}&background_color=${bgPrimary}&text_color=${textPrimary}`;
}

function waitForThemeReady(callback: () => void): void {
  const html = document.documentElement;
  const hasTheme = html.classList.contains('dark') || html.classList.contains('light');
  
  function ensureDarkDefault(): void {
    if (!html.classList.contains('dark') && !html.classList.contains('light')) {
      html.classList.add('dark');
    }
  }
  
  function checkCssVars(): boolean {
    const bgPrimary = getComputedStyle(html).getPropertyValue('--bg-primary').trim();
    const textPrimary = getComputedStyle(html).getPropertyValue('--text-primary').trim();
    const accentGreen = getComputedStyle(html).getPropertyValue('--accent-green').trim();
    return !!(bgPrimary && textPrimary && accentGreen);
  }
  
  function executeCallback(): void {
    ensureDarkDefault();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (checkCssVars()) {
          callback();
        } else {
          setTimeout(executeCallback, 50);
        }
      });
    });
  }
  
  ensureDarkDefault();
  
  if (hasTheme && checkCssVars()) {
    setTimeout(executeCallback, 100);
  } else if (hasTheme) {
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = setInterval(() => {
      attempts++;
      if (checkCssVars() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        executeCallback();
      }
    }, 50);
  } else {
    let resolved = false;
    const observer = new MutationObserver(() => {
      ensureDarkDefault();
      if ((html.classList.contains('dark') || html.classList.contains('light')) && !resolved) {
        resolved = true;
        observer.disconnect();
        setTimeout(executeCallback, 100);
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        observer.disconnect();
        ensureDarkDefault();
        executeCallback();
      }
    }, 500);
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

function applyScrollbarFix(): void {
  const widget = document.getElementById(WIDGET_ID);
  if (!widget) return;

  const container = widget.closest('.calendly-inline-widget-container') as HTMLElement;
  if (container) {
    container.style.setProperty('overflow', 'hidden', 'important');
    container.style.setProperty('scrollbar-width', 'none', 'important');
    container.style.setProperty('-ms-overflow-style', 'none', 'important');
  }

  const iframe = widget.querySelector('iframe');
  if (iframe) {
    iframe.style.setProperty('overflow', 'hidden', 'important');
    iframe.style.setProperty('scrollbar-width', 'none', 'important');
    iframe.style.setProperty('-ms-overflow-style', 'none', 'important');
  }
  
  const widgetDivs = widget.querySelectorAll('.calendly-inline-widget > div, .calendly-inline-widget > div > div');
  widgetDivs.forEach((div) => {
    const el = div as HTMLElement;
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('scrollbar-width', 'none', 'important');
    el.style.setProperty('-ms-overflow-style', 'none', 'important');
  });
}

function startScrollbarFix(): void {
  if (scrollbarFixInterval) {
    clearInterval(scrollbarFixInterval);
  }
  
  applyScrollbarFix();
  scrollbarFixInterval = window.setInterval(applyScrollbarFix, 200);
  
  setTimeout(() => {
    if (scrollbarFixInterval) {
      clearInterval(scrollbarFixInterval);
      scrollbarFixInterval = null;
    }
  }, 3000);
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
    win.Calendly.initInlineWidget({ url, parentElement: widget });
    isInitialized = true;
    
    startScrollbarFix();
    
    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
  }
}

function handleThemeChange(): void {
  const html = document.documentElement;
  const currentTheme = html.classList.contains('dark') ? 'dark' : html.classList.contains('light') ? 'light' : null;
  const win = window as CalendlyWindow;
  
  if (!currentTheme) return;
  
  if (currentTheme !== lastTheme && win.Calendly && isInitialized) {
    lastTheme = currentTheme;
    
    if (themeChangeTimeout) {
      clearTimeout(themeChangeTimeout);
    }
    
    themeChangeTimeout = window.setTimeout(() => {
      const widget = document.getElementById(WIDGET_ID);
      if (widget?.querySelector('.calendly-inline-widget > div')) {
        initWidget(true);
      }
    }, 300);
  } else if (!lastTheme) {
    lastTheme = currentTheme;
  }
}

export function setupCalendly(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  function initialize(): void {
    const html = document.documentElement;
    if (!html.classList.contains('dark') && !html.classList.contains('light')) {
      html.classList.add('dark');
    }
    lastTheme = html.classList.contains('dark') ? 'dark' : html.classList.contains('light') ? 'light' : 'dark';

    const themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
          break;
        }
      }
    });
    themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });

    const widget = document.getElementById(WIDGET_ID);
    if (!widget) {
      if (import.meta.env.DEV) {
        console.warn('Calendly widget container not found');
      }
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
            if (intersectionObserver) {
              intersectionObserver.disconnect();
              intersectionObserver = null;
            }
          }
        }, { rootMargin: '100px' });
        intersectionObserver.observe(widget);
      }
    };
    
    waitForThemeReady(initWithTheme);

    let currentPath = window.location.pathname;
    document.addEventListener('astro:page-load', () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath && (newPath === '/contact/' || newPath === '/contact')) {
        isInitialized = false;
        lastTheme = null;
        currentPath = newPath;
        
        if (scrollbarFixInterval) {
          clearInterval(scrollbarFixInterval);
          scrollbarFixInterval = null;
        }
        
        const widget = document.getElementById(WIDGET_ID);
        if (widget) {
          widget.innerHTML = '';
          if (intersectionObserver) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
          }
          waitForThemeReady(() => {
            initWidget();
          });
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
