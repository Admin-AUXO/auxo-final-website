import { BREAKPOINTS } from '../constants';

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "themechange";
const THEME_CHANGE_DURATION = 100; // Even faster response time
const SWITCH_TRANSFORM_LIGHT = "translateX(calc(3rem - 1.25rem - 0.125rem))";
const SWITCH_TRANSFORM_DARK = "translateX(0)";

type Theme = "light" | "dark";

let isThemeChanging = false;
let lastThemeChange = 0;
const THEME_CHANGE_DEBOUNCE = 100;

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < BREAKPOINTS.MD;
}

function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored) return stored;

  if (isMobileDevice()) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateIcon(theme);
}

function updateMobileSwitch(toggle: Element, theme: Theme): void {
  const switchKnob = toggle.querySelector(".theme-switch-knob") as HTMLElement | null;
  const switchBg = toggle.querySelector(".theme-switch-bg");
  const darkIcon = toggle.querySelector(".theme-icon-dark");
  const lightIcon = toggle.querySelector(".theme-icon-light");

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

  const calendarModal = document.getElementById('calendar-modal');
  if (calendarModal && !calendarModal.hasAttribute('hidden')) {
    return;
  }

  isThemeChanging = true;
  lastThemeChange = now;

  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  if ((document as any).startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const transition = (document as any).startViewTransition(() => {
      applyTheme(newTheme);
      updateIcon(newTheme);
    });

    transition.finished.finally(() => {
      document.dispatchEvent(
        new CustomEvent(THEME_CHANGE_EVENT, {
          detail: { theme: newTheme, duration: 250 },
        })
      );
      isThemeChanging = false;
    });
  } else {
    applyTheme(newTheme);
    updateIcon(newTheme);

    setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent(THEME_CHANGE_EVENT, {
          detail: { theme: newTheme, duration: 250 },
        })
      );
      isThemeChanging = false;
    }, 250);
  }
}

function attachToggleListeners(toggle: Element): void {
  let touchHandled = false;

  const clickHandler = (e: Event) => {
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

  toggle.addEventListener("touchend", touchEndHandler, { passive: false, capture: true });
  toggle.addEventListener("click", clickHandler, { passive: false, capture: true });
}

function setupThemeToggles(): void {
  document.querySelectorAll("#theme-toggle-desktop, #theme-toggle-mobile").forEach(attachToggleListeners);
}

function setupThemePreferenceListener(): void {
  if (typeof window === "undefined") return;

  if (!isMobileDevice()) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    let lastSystemTheme = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      if (e.matches === lastSystemTheme || localStorage.getItem(THEME_STORAGE_KEY)) {
        return;
      }

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
    const toggles = document.querySelectorAll("#theme-toggle-desktop, #theme-toggle-mobile");
    if (toggles.length === 0) return;

    applyTheme(getTheme());

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

  applyTheme(getTheme());
  setupThemeToggles();
  setupThemePreferenceListener();
  handleAstroPageLoad();
  updateIcon(getTheme());
}

