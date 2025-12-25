const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "themechange";
const THEME_CHANGE_DURATION = 100; // Even faster response time
const SWITCH_TRANSFORM_LIGHT = "translateX(calc(3rem - 1.25rem - 0.125rem))";
const SWITCH_TRANSFORM_DARK = "translateX(0)";

type Theme = "light" | "dark";

// Prevent rapid successive theme changes
let isThemeChanging = false;
let lastThemeChange = 0;
const THEME_CHANGE_DEBOUNCE = 100; // Minimum time between changes

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
}

function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored) return stored;

  // On mobile devices, ignore system preference and default to dark theme
  if (isMobileDevice()) {
    return "dark";
  }

  // On desktop, respect system preference
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
  // Apply theme instantly
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // Update icons immediately for instant feedback
  updateIcon(theme);
}

function updateMobileSwitch(toggle: Element, theme: Theme): void {
  const switchKnob = toggle.querySelector(".theme-switch-knob") as HTMLElement | null;
  const switchBg = toggle.querySelector(".theme-switch-bg");
  const darkIcon = toggle.querySelector(".theme-icon-dark");
  const lightIcon = toggle.querySelector(".theme-icon-light");

  // Directly set transform for immediate visual feedback
  if (switchKnob) {
    switchKnob.style.transform = theme === "dark" ? SWITCH_TRANSFORM_DARK : SWITCH_TRANSFORM_LIGHT;
  }

  if (switchBg) {
    switchBg.classList.toggle("bg-accent-green/20", theme === "light");
    switchBg.classList.toggle("bg-surface", theme === "dark");
  }

  if (darkIcon && lightIcon) {
    darkIcon.classList.toggle("opacity-100", theme === "dark");
    darkIcon.classList.toggle("opacity-0", theme === "light");
    lightIcon.classList.toggle("opacity-100", theme === "light");
    lightIcon.classList.toggle("opacity-0", theme === "dark");
  }
}

function updateDesktopIcon(toggle: Element, theme: Theme): void {
  const darkIcon = toggle.querySelector(".theme-icon-dark");
  const lightIcon = toggle.querySelector(".theme-icon-light");

  if (!darkIcon || !lightIcon) return;

  const isDark = theme === "dark";
  darkIcon.classList.toggle("opacity-100", isDark);
  darkIcon.classList.toggle("opacity-0", !isDark);
  darkIcon.classList.toggle("rotate-0", isDark);
  darkIcon.classList.toggle("rotate-90", !isDark);
  darkIcon.classList.toggle("scale-100", isDark);
  darkIcon.classList.toggle("scale-0", !isDark);

  lightIcon.classList.toggle("opacity-100", !isDark);
  lightIcon.classList.toggle("opacity-0", isDark);
  lightIcon.classList.toggle("rotate-0", !isDark);
  lightIcon.classList.toggle("rotate-90", isDark);
  lightIcon.classList.toggle("scale-100", !isDark);
  lightIcon.classList.toggle("scale-0", isDark);
}

function updateIcon(theme: Theme): void {
  const toggles = document.querySelectorAll("#theme-toggle-desktop, #theme-toggle-mobile");
  toggles.forEach((toggle) => {
    const isMobileSwitch = toggle.getAttribute("data-mobile-switch") === "true";
    isMobileSwitch ? updateMobileSwitch(toggle, theme) : updateDesktopIcon(toggle, theme);
  });
}

function toggleTheme(e?: Event): void {
  e?.preventDefault();
  e?.stopPropagation();
  e?.stopImmediatePropagation();

  const now = Date.now();

  // Prevent rapid successive theme changes
  if (isThemeChanging || (now - lastThemeChange) < THEME_CHANGE_DEBOUNCE) {
    return;
  }

  // Prevent theme changes when calendar modal is open
  const calendarModal = document.getElementById('calendar-modal');
  if (calendarModal && !calendarModal.hasAttribute('hidden')) {
    return; // Don't change theme while calendar modal is open
  }

  isThemeChanging = true;
  lastThemeChange = now;

  // Get current theme and toggle it
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  // Apply theme instantly without delays
  applyTheme(newTheme);

  // Force icon update immediately to prevent visual lag
  updateIcon(newTheme);

  // Dispatch event for any listeners (with minimal delay)
  setTimeout(() => {
    document.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme: newTheme, duration: THEME_CHANGE_DURATION },
      })
    );
    isThemeChanging = false;
  }, 16); // One frame delay
}

function attachToggleListeners(toggle: Element): void {
  let touchHandled = false;

  const clickHandler = (e: Event) => {
    // Prevent click if touch was already handled
    if (touchHandled) {
      touchHandled = false;
      return;
    }
    toggleTheme(e);
  };

  const touchEndHandler = (e: Event) => {
    touchHandled = true;
    toggleTheme(e);
  };

  // Use touchend for mobile (more reliable than touchstart/touchend combo)
  // Prevents double triggers on touch devices
  toggle.addEventListener("touchend", touchEndHandler, { passive: false, capture: true });
  toggle.addEventListener("click", clickHandler, { passive: false, capture: true });
}

function setupThemeToggles(): void {
  document.querySelectorAll("#theme-toggle-desktop, #theme-toggle-mobile").forEach(attachToggleListeners);
}

function setupThemePreferenceListener(): void {
  if (typeof window === "undefined") return;

  // Disable system theme preference listener on mobile devices
  if (!isMobileDevice()) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    let lastSystemTheme = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      // Only respond if system theme actually changed and no user preference stored
      if (e.matches === lastSystemTheme || localStorage.getItem(THEME_STORAGE_KEY)) {
        return;
      }

      // Don't change theme if calendar modal is open
      const calendarModal = document.getElementById('calendar-modal');
      if (calendarModal && !calendarModal.hasAttribute('hidden')) {
        return;
      }

      lastSystemTheme = e.matches;
      applyTheme(e.matches ? "light" : "dark");
    };
    mediaQuery.addEventListener("change", handler);
  }

  document.addEventListener(THEME_CHANGE_EVENT, ((e: CustomEvent) => {
    updateIcon(e.detail?.theme || getTheme());
  }) as EventListener, { once: false });
}

function handleAstroPageLoad(): void {
  document.addEventListener("astro:page-load", () => {
    // Only re-attach listeners if needed, don't clone DOM unnecessarily
    const toggles = document.querySelectorAll("#theme-toggle-desktop, #theme-toggle-mobile");
    if (toggles.length === 0) return;

    // Just ensure theme is applied and listeners are attached
    applyTheme(getTheme());

    // Check if listeners are already attached (avoid duplicates)
    toggles.forEach((toggle) => {
      if (!(toggle as any)._themeListenerAttached) {
        attachToggleListeners(toggle);
        (toggle as any)._themeListenerAttached = true;
      }
    });
  });
}

export function initThemeToggle(): void {
  if (!document.getElementById("theme-toggle-desktop") && !document.getElementById("theme-toggle-mobile")) return;

  // Initialize theme and listeners
  applyTheme(getTheme());
  setupThemeToggles();
  setupThemePreferenceListener();
  handleAstroPageLoad();

  // Single icon update after initialization
  updateIcon(getTheme());
}

