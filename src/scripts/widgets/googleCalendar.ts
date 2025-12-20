const CALENDAR_URL = 'https://calendar.app.google/6jRXDXyftxSPkGKZ6';

let initializedButtons = new WeakSet<HTMLElement>();

function getCurrentTheme(): string {
  if (typeof document === 'undefined' || !document.documentElement) return 'dark';
  const html = document.documentElement;
  if (html.classList.contains('dark')) return 'dark';
  if (html.classList.contains('light')) return 'light';
  return 'dark';
}

function makeFullscreen(popup: Window | null): void {
  if (!popup || popup.closed) return;

  try {
    popup.moveTo(0, 0);
    popup.resizeTo(window.screen.width, window.screen.height);
    
    const checkInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkInterval);
        return;
      }
      
      try {
        const popupDoc = popup.document;
        if (popupDoc) {
          const currentTheme = getCurrentTheme();
          popupDoc.documentElement.setAttribute('data-theme', currentTheme);
          popupDoc.documentElement.classList.add(currentTheme);
          
          if (popupDoc.body) {
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

          const iframes = popupDoc.querySelectorAll('iframe');
          iframes.forEach((iframe) => {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.setAttribute('allowfullscreen', 'true');
          });
        }
      } catch (e) {
      }
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 5000);
  } catch (e) {
  }
}

function openCalendarPopup(): void {
  const width = window.screen.width;
  const height = window.screen.height;
  const left = 0;
  const top = 0;
  
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no'
  ].join(',');

  const popup = window.open(
    CALENDAR_URL,
    'GoogleCalendar',
    features
  );

  if (popup) {
    popup.focus();
    setTimeout(() => makeFullscreen(popup), 100);
    
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

  button.addEventListener('click', handleClick, { capture: true, passive: false });
  
  if (button instanceof HTMLAnchorElement) {
    button.removeAttribute('href');
    button.removeAttribute('target');
    button.style.cursor = 'pointer';
  }

  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  });

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
      setupCalendarButton(link);
    }
  });
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  setupCalendarButtons();

  const html = document.documentElement;
  if (html) {
    const themeObserver = new MutationObserver(() => {
      setupCalendarButtons();
    });
    themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('astro:page-load', () => {
    setTimeout(() => {
      setupCalendarButtons();
    }, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCalendarButtons, { once: true });
  } else {
    setupCalendarButtons();
  }

  window.addEventListener('load', setupCalendarButtons);

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-google-calendar-open]');
    if (button && !initializedButtons.has(button)) {
      setupCalendarButton(button);
      button.click();
    }
  }, { capture: true });
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
