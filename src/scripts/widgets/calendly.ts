interface CalendlyWindow extends Window {
  Calendly?: {
    initBadgeWidget: (options: {
      url: string;
      text: string;
      color: string;
      textColor: string;
      branding: boolean;
    }) => void;
    initPopupWidget: (options: { url: string }) => void;
  };
}

const CALENDLY_URL = 'https://calendly.com/admin-auxodata/30min';
const SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';
const THEME_CHANGE_DELAY = 300;

let isInitialized = false;
let isScriptLoading = false;
let themeChangeTimeout: number | null = null;
let lastTheme: string | null = null;

function getCssVar(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function isDarkTheme(): boolean {
  const html = document.documentElement;
  return html.classList.contains('dark') || (!html.classList.contains('light') && !html.classList.contains('dark'));
}

function getCalendlyUrl(): string {
  const isDark = isDarkTheme();
  const accentGreen = getCssVar('--accent-green', '#A3E635').replace('#', '');
  const bgPrimary = getCssVar('--bg-primary', isDark ? '#000000' : '#FFFFFF').replace('#', '');
  const textPrimary = getCssVar('--text-primary', isDark ? '#FFFFFF' : '#000000').replace('#', '');
  
  const params = new URLSearchParams({
    hide_gdpr_banner: '1',
    primary_color: accentGreen,
    background_color: bgPrimary,
    text_color: textPrimary
  });
  
  return `${CALENDLY_URL}?${params.toString()}`;
}

function getButtonColors(): { color: string; textColor: string } {
  return {
    color: getCssVar('--accent-green', '#A3E635'),
    textColor: isDarkTheme() ? '#000000' : '#FFFFFF'
  };
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
    
    const style = getComputedStyle(html);
    return !!(style.getPropertyValue('--bg-primary').trim() && 
             style.getPropertyValue('--text-primary').trim() && 
             style.getPropertyValue('--accent-green').trim());
  };
  
  const executeCallback = () => requestAnimationFrame(() => requestAnimationFrame(callback));
  
  if (checkReady()) {
    executeCallback();
    return;
  }
  
  let attempts = 0;
  const maxAttempts = 50;
  const checkInterval = setInterval(() => {
    if (checkReady() || ++attempts >= maxAttempts) {
      clearInterval(checkInterval);
      executeCallback();
    }
  }, 50);
  
  const observer = new MutationObserver(() => {
    if (checkReady()) {
      observer.disconnect();
      clearInterval(checkInterval);
      executeCallback();
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
        executeCallback();
      }
    }, { once: true });
  }
}

function loadCalendlyResources(callback: () => void): void {
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
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
  
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

function initPopupWidget(): void {
  const win = window as CalendlyWindow;
  if (!win.Calendly) {
    loadCalendlyResources(() => initPopupWidget());
    return;
  }

  if (isInitialized) return;

  const url = getCalendlyUrl();
  const { color, textColor } = getButtonColors();

  win.Calendly.initBadgeWidget({
    url,
    text: 'Schedule time with me',
    color,
    textColor,
    branding: false
  });

  isInitialized = true;
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
      const badge = document.querySelector('.calendly-badge-widget');
      if (badge) {
        badge.remove();
        isInitialized = false;
        initPopupWidget();
      }
    }, THEME_CHANGE_DELAY);
  } else if (!lastTheme) {
    lastTheme = currentTheme;
  }
}

export function openCalendlyPopup(): void {
  const win = window as CalendlyWindow;
  if (!win.Calendly) {
    loadCalendlyResources(() => {
      const url = getCalendlyUrl();
      win.Calendly?.initPopupWidget({ url });
    });
    return;
  }
  
  const url = getCalendlyUrl();
  win.Calendly.initPopupWidget({ url });
}

export function setupCalendly(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  function initialize(): void {
    ensureThemeReady();
    lastTheme = getCurrentTheme();

    const themeObserver = new MutationObserver(handleThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    waitForThemeAndCssVars(() => {
      initPopupWidget();
      setupPopupTriggers();
    });
  }

  function setupPopupTriggers(): void {
    const triggers = document.querySelectorAll('[data-calendly-trigger]');
    triggers.forEach((trigger) => {
      if (trigger.hasAttribute('data-trigger-initialized')) return;
      trigger.setAttribute('data-trigger-initialized', 'true');
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openCalendlyPopup();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  document.addEventListener('astro:page-load', () => {
    waitForThemeAndCssVars(() => {
      setupPopupTriggers();
    });
  });
}
