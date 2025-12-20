interface CalendlyWindow extends Window {
  Calendly?: {
    initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    initBadgeWidget: (options: {
      url: string;
      text: string;
      color: string;
      textColor: string;
      branding: boolean;
    }) => void;
  };
}

const CALENDLY_URL = 'https://calendly.com/admin-auxodata/30min';
const SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';
const MODAL_ID = 'calendly-modal';
const WIDGET_ID = 'calendly-widget';
const THEME_CHANGE_DELAY = 300;

let isInitialized = false;
let isScriptLoading = false;
let themeChangeTimeout: number | null = null;
let lastTheme: string | null = null;

function getCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined' || !document.documentElement) return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getCurrentTheme(): string {
  if (typeof document === 'undefined' || !document.documentElement) return 'dark';
  const html = document.documentElement;
  if (html.classList.contains('dark')) return 'dark';
  if (html.classList.contains('light')) return 'light';
  return 'dark';
}

function getCalendlyUrl(): string {
  const isDark = getCurrentTheme() === 'dark';
  
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

function getButtonColor(): string {
  return getCssVar('--accent-green', '#A3E635');
}

function getButtonTextColor(): string {
  const isDark = getCurrentTheme() === 'dark';
  return isDark ? '#000000' : '#FFFFFF';
}

function ensureThemeReady(): void {
  if (typeof document === 'undefined' || !document.documentElement) return;
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

function initModalWidget(): void {
  const widget = document.getElementById(WIDGET_ID);
  if (!widget) return;

  const win = window as CalendlyWindow;
  if (!win.Calendly) {
    loadCalendlyResources(() => initModalWidget());
    return;
  }

  const hasContent = widget.querySelector('.calendly-inline-widget > div');
  if (hasContent) return;

  const url = getCalendlyUrl();
  widget.setAttribute('data-url', url);
  win.Calendly.initInlineWidget({ url, parentElement: widget });
}

function openModal(): void {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  document.body.style.overflow = 'hidden';
  modal.classList.remove('hidden');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  
  waitForThemeAndCssVars(() => {
    initModalWidget();
  });
}

function closeModal(): void {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  document.body.style.overflow = '';
  modal.classList.remove('show');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function attachBadgeClickHandler(): void {
  const badge = document.querySelector('.calendly-badge-widget');
  if (badge && !badge.hasAttribute('data-calendly-handler-attached')) {
    badge.setAttribute('data-calendly-handler-attached', 'true');
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
  }
}

function initFloatingButton(): void {
  const win = window as CalendlyWindow;
  if (!win.Calendly) {
    loadCalendlyResources(() => initFloatingButton());
    return;
  }

  if (isInitialized) {
    attachBadgeClickHandler();
    return;
  }

  const url = getCalendlyUrl();
  const buttonColor = getButtonColor();
  const buttonTextColor = getButtonTextColor();

  win.Calendly.initBadgeWidget({
    url,
    text: '',
    color: buttonColor,
    textColor: buttonTextColor,
    branding: false
  });

  let attempts = 0;
  const maxAttempts = 20;
  const checkBadge = setInterval(() => {
    attempts++;
    const badge = document.querySelector('.calendly-badge-widget');
    if (badge || attempts >= maxAttempts) {
      clearInterval(checkBadge);
      if (badge) {
        attachBadgeClickHandler();
      }
    }
  }, 100);

  isInitialized = true;
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
        initFloatingButton();
      }
      
      const widget = document.getElementById(WIDGET_ID);
      if (widget) {
        widget.innerHTML = '';
        initModalWidget();
      }
    }, THEME_CHANGE_DELAY);
  } else if (!lastTheme) {
    lastTheme = currentTheme;
  }
  
  attachBadgeClickHandler();
  } else if (!lastTheme) {
    lastTheme = currentTheme;
  }
}

function setupCalendlyButtons(): void {
  const buttons = document.querySelectorAll('[data-calendly-open]');
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
  });
}

export function setupCalendly(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  function initialize(): void {
    ensureThemeReady();
    lastTheme = getCurrentTheme();

    const themeObserver = new MutationObserver(handleThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      const closeButtons = modal.querySelectorAll('[data-calendly-close]');
      closeButtons.forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal || (e.target as HTMLElement).classList.contains('calendly-modal-overlay')) {
          closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          closeModal();
        }
      });
    }

    setupCalendlyButtons();
    
    document.addEventListener('astro:page-load', () => {
      setupCalendlyButtons();
      attachBadgeClickHandler();
    });

    waitForThemeAndCssVars(() => {
      initFloatingButton();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}

export function openCalendlyModal(): void {
  openModal();
}
