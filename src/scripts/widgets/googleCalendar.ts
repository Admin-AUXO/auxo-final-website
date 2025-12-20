const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2C0u3FKkxjcB1xO6fM48pvPj4Gu32PZAMVDq889-Nuer8fP_zWvl95xV_r4O5fm2Ry_KP1vnNG?gv=true';

let isInitialized = false;
let isScriptLoading = false;
let initializedButtons = new WeakSet<HTMLElement>();

function getCurrentTheme(): string {
  if (typeof document === 'undefined' || !document.documentElement) return 'dark';
  const html = document.documentElement;
  if (html.classList.contains('dark')) return 'dark';
  if (html.classList.contains('light')) return 'light';
  return 'dark';
}

function getThemeColor(): string {
  return '#7CB342';
}

function loadCalendarResources(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve();
      return;
    }

    if ((window as any).calendar?.schedulingButton) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      const checkInterval = setInterval(() => {
        if ((window as any).calendar?.schedulingButton) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    isScriptLoading = true;

    const link = document.createElement('link');
    link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    link.rel = 'stylesheet';
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    script.async = true;
    script.onload = () => {
      isScriptLoading = false;
      setTimeout(resolve, 100);
    };
    script.onerror = () => {
      isScriptLoading = false;
      resolve();
    };
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script);
    } else {
      isScriptLoading = false;
      setTimeout(resolve, 100);
    }
  });
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

function setupCalendarButton(button: HTMLElement): void {
  if (initializedButtons.has(button)) return;

  const color = getThemeColor();
  const currentTheme = getCurrentTheme();

  try {
    const existingContent = button.innerHTML;
    button.innerHTML = '';
    
    (window as any).calendar.schedulingButton.load({
      url: CALENDAR_URL,
      color: color,
      label: 'Book an appointment',
      target: button,
    });

    initializedButtons.add(button);

    setTimeout(() => {
      const calendarButton = button.querySelector('button');
      const calendarIframe = button.querySelector('iframe');
      
      if (calendarButton) {
        calendarButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
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
        });
      }

      if (calendarIframe) {
        calendarIframe.style.width = '100%';
        calendarIframe.style.height = '100%';
        calendarIframe.style.border = 'none';
        calendarIframe.setAttribute('allowfullscreen', 'true');
        
        calendarIframe.addEventListener('load', () => {
          try {
            const iframeDoc = calendarIframe.contentDocument || calendarIframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.documentElement.setAttribute('data-theme', currentTheme);
              if (currentTheme === 'dark') {
                iframeDoc.body?.classList.add('dark');
              }
            }
          } catch (e) {
          }
        });
      }
    }, 200);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error initializing Google Calendar button:', error);
    }
  }
}

function setupCalendarButtons(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!(window as any).calendar?.schedulingButton) return;

  const buttons = document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
  buttons.forEach((button) => {
    if (!initializedButtons.has(button)) {
      setupCalendarButton(button);
    }
  });
}

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isInitialized) return;
  isInitialized = true;

  loadCalendarResources().then(() => {
    setupCalendarButtons();

    const html = document.documentElement;
    if (html) {
      const themeObserver = new MutationObserver(() => {
        const buttons = document.querySelectorAll<HTMLElement>('[data-google-calendar-open]');
        buttons.forEach((button) => {
          const iframe = button.querySelector('iframe');
          if (iframe) {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                const currentTheme = getCurrentTheme();
                iframeDoc.documentElement.setAttribute('data-theme', currentTheme);
                if (currentTheme === 'dark') {
                  iframeDoc.body?.classList.add('dark');
                } else {
                  iframeDoc.body?.classList.remove('dark');
                }
              }
            } catch (e) {
            }
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
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadCalendarResources().then(setupCalendarButtons);
    }, { once: true });
  } else {
    loadCalendarResources().then(setupCalendarButtons);
  }

  window.addEventListener('load', () => {
    loadCalendarResources().then(setupCalendarButtons);
  });
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

  const button = target || document.querySelector<HTMLElement>('[data-google-calendar-open]');
  if (!button) {
    const tempButton = document.createElement('button');
    tempButton.setAttribute('data-google-calendar-open', '');
    tempButton.style.display = 'none';
    document.body.appendChild(tempButton);
    loadCalendarResources().then(() => {
      setupCalendarButton(tempButton);
      tempButton.click();
      setTimeout(() => tempButton.remove(), 100);
    });
  } else {
    loadCalendarResources().then(() => {
      setupCalendarButton(button);
      button.click();
    });
  }
}
