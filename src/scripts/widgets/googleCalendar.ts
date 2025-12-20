const CALENDAR_URL = 'https://calendar.app.google/6jRXDXyftxSPkGKZ6';
const FULLSCREEN_CHECK_INTERVAL = 200;
const FULLSCREEN_CHECK_DURATION = 20000;
const INITIAL_FULLSCREEN_ATTEMPTS = [50, 150, 300, 500, 1000];

const initializedButtons = new WeakSet<HTMLElement>();

function getCurrentTheme(): string {
  if (typeof document === 'undefined' || !document.documentElement) return 'dark';
  const html = document.documentElement;
  return html.classList.contains('light') ? 'light' : 'dark';
}

function makeFullscreen(popup: Window | null): void {
  if (!popup || popup.closed) return;

  try {
    const screenWidth = window.screen.availWidth || window.screen.width || window.innerWidth;
    const screenHeight = window.screen.availHeight || window.screen.height || window.innerHeight;
    
    popup.moveTo(0, 0);
    popup.resizeTo(screenWidth, screenHeight);
    
    const checkInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkInterval);
        return;
      }
      
      try {
        const currentWidth = window.screen.availWidth || window.screen.width || window.innerWidth;
        const currentHeight = window.screen.availHeight || window.screen.height || window.innerHeight;
        
        if (popup.outerWidth !== currentWidth || popup.outerHeight !== currentHeight) {
          popup.resizeTo(currentWidth, currentHeight);
        }
        
        if (popup.screenX !== 0 || popup.screenY !== 0) {
          popup.moveTo(0, 0);
        }
        
        const popupDoc = popup.document;
        if (popupDoc) {
          const currentTheme = getCurrentTheme();
          popupDoc.documentElement.setAttribute('data-theme', currentTheme);
          popupDoc.documentElement.classList.add(currentTheme);
          
          if (popupDoc.body) {
            popupDoc.body.style.margin = '0';
            popupDoc.body.style.padding = '0';
            popupDoc.body.style.width = '100%';
            popupDoc.body.style.height = '100%';
            popupDoc.body.style.overflow = 'hidden';
            
            if (currentTheme === 'dark') {
              popupDoc.body.classList.add('dark');
              popupDoc.body.style.backgroundColor = '#000';
              popupDoc.body.style.color = '#fff';
            } else {
              popupDoc.body.classList.remove('dark');
              popupDoc.body.style.backgroundColor = '#fff';
              popupDoc.body.style.color = '#000';
            }
          }

          const html = popupDoc.documentElement;
          if (html) {
            html.style.width = '100%';
            html.style.height = '100%';
            html.style.margin = '0';
            html.style.padding = '0';
            html.style.overflow = 'hidden';
          }

          const iframes = popupDoc.querySelectorAll('iframe');
          iframes.forEach((iframe) => {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.setAttribute('allowfullscreen', 'true');
          });
        }
      } catch (e) {
      }
    }, FULLSCREEN_CHECK_INTERVAL);

    setTimeout(() => clearInterval(checkInterval), FULLSCREEN_CHECK_DURATION);
  } catch (e) {
  }
}

function openCalendarPopup(): void {
  const screenWidth = window.screen.availWidth || window.screen.width || window.innerWidth;
  const screenHeight = window.screen.availHeight || window.screen.height || window.innerHeight;
  const left = 0;
  const top = 0;
  
  const features = [
    `width=${screenWidth}`,
    `height=${screenHeight}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'fullscreen=yes'
  ].join(',');

  const popup = window.open(
    CALENDAR_URL,
    'GoogleCalendar',
    features
  );

  if (popup) {
    popup.focus();
    
    const attemptFullscreen = () => {
      try {
        if (popup && !popup.closed) {
          const w = window.screen.availWidth || window.screen.width || window.innerWidth;
          const h = window.screen.availHeight || window.screen.height || window.innerHeight;
          popup.moveTo(0, 0);
          popup.resizeTo(w, h);
        }
      } catch (e) {
      }
    };
    
    INITIAL_FULLSCREEN_ATTEMPTS.forEach(delay => {
      setTimeout(attemptFullscreen, delay);
    });
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
      } else {
        try {
          makeFullscreen(popup);
        } catch (e) {
        }
      }
    }, 500);
    
    setTimeout(() => clearInterval(checkClosed), FULLSCREEN_CHECK_DURATION);
  } else {
    if (import.meta.env.DEV) {
      console.warn('Popup blocked. Please allow popups for this site.');
    }
  }
}

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  const handleClick = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openCalendarPopup();
    return false;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };

  button.addEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
  button.addEventListener('click', handleClick, { capture: true, passive: false });
  button.addEventListener('auxclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, { capture: true, passive: false });
  
  if (button instanceof HTMLAnchorElement) {
    button.removeAttribute('href');
    button.removeAttribute('target');
    button.setAttribute('role', 'button');
    button.style.cursor = 'pointer';
    button.onclick = () => false;
  }

  if (!button.hasAttribute('role')) {
    button.setAttribute('role', 'button');
  }
  button.setAttribute('tabindex', '0');
  
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e);
    }
  }, { capture: true });

  initializedButtons.add(button);
}

function setupCalendarButtons(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const buttons = document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
  buttons.forEach((button) => {
    if (!initializedButtons.has(button)) {
      setupCalendarButton(button);
    }
  });

  const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="calendar.app.google"], a[href*="calendar.google.com"]');
  links.forEach((link) => {
    if (!link.hasAttribute('data-google-calendar-open') && !initializedButtons.has(link)) {
      link.setAttribute('data-google-calendar-open', '');
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.setAttribute('role', 'button');
      link.onclick = () => false;
      setupCalendarButton(link);
    }
  });
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-google-calendar-open]');
    if (button) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (!initializedButtons.has(button)) {
        setupCalendarButton(button);
      }
      openCalendarPopup();
      return false;
    }
  };

  document.addEventListener('click', handleGlobalClick, { capture: true, passive: false });
  document.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-google-calendar-open]');
    if (button && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, { capture: true, passive: false });

  setupCalendarButtons();

  const html = document.documentElement;
  if (html) {
    const themeObserver = new MutationObserver(setupCalendarButtons);
    themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('astro:page-load', () => {
    setTimeout(setupCalendarButtons, 100);
  }, { once: false });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCalendarButtons, { once: true });
  } else {
    setupCalendarButtons();
  }

  window.addEventListener('load', setupCalendarButtons, { once: true });
}

export function setupGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  try {
    initializeGoogleCalendar();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error setting up Google Calendar:', error);
    }
  }
}

export function openGoogleCalendar(target?: HTMLElement): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  openCalendarPopup();
}
