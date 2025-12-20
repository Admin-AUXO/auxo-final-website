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
  const popup = window.open(
    CALENDAR_URL,
    'Google Calendar',
    'width=' + window.screen.width + ',height=' + window.screen.height + ',left=0,top=0,resizable=yes,scrollbars=yes'
  );

  if (popup) {
    setTimeout(() => makeFullscreen(popup), 100);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
      } else {
        makeFullscreen(popup);
      }
    }, 500);
  }
}

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCalendarPopup();
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
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  setupCalendarButtons();

  const html = document.documentElement;
  if (html) {
    const themeObserver = new MutationObserver(() => {
      const buttons = document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
      buttons.forEach((button) => {
        if (!initializedButtons.has(button)) {
          setupCalendarButton(button);
        }
      });
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
