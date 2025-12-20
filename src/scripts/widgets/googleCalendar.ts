const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2C0u3FKkxjcB1xO6fM48pvPj4Gu32PZAMVDq889-Nuer8fP_zWvl95xV_r4O5fm2Ry_KP1vnNG?gv=true';

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

function initializeGoogleCalendar(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
  script.async = true;
  document.head.appendChild(script);

  function setupCalendarButtons(): void {
    if (typeof (window as any).calendar === 'undefined' || !(window as any).calendar?.schedulingButton) {
      setTimeout(setupCalendarButtons, 100);
      return;
    }

    const buttons = document.querySelectorAll('[data-google-calendar-open]');
    buttons.forEach((button) => {
      if (button.hasAttribute('data-calendar-initialized')) return;
      button.setAttribute('data-calendar-initialized', 'true');

      const target = button as HTMLElement;
      const color = getThemeColor();

      try {
        (window as any).calendar.schedulingButton.load({
          url: CALENDAR_URL,
          color: color,
          label: 'Book an appointment',
          target,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error initializing Google Calendar button:', error);
        }
      }
    });
  }

  window.addEventListener('load', () => {
    setupCalendarButtons();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCalendarButtons, { once: true });
  } else {
    setupCalendarButtons();
  }

  const html = document.documentElement;
  if (html) {
    const themeObserver = new MutationObserver(() => {
      const buttons = document.querySelectorAll('[data-google-calendar-open]');
      buttons.forEach((button) => {
        button.removeAttribute('data-calendar-initialized');
      });
      setTimeout(setupCalendarButtons, 100);
    });
    themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('astro:page-load', () => {
    setTimeout(setupCalendarButtons, 200);
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
