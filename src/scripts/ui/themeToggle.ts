const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "themechange";
const THEME_CHANGE_DURATION = 300;
const SWITCH_TRANSFORM_LIGHT = "translateX(calc(3rem - 1.25rem - 0.125rem))";
const SWITCH_TRANSFORM_DARK = "translateX(0)";

type Theme = "light" | "dark";

function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored) return stored;
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
    switchKnob.style.setProperty(
      "--theme-switch-transform",
      theme === "dark" ? SWITCH_TRANSFORM_DARK : SWITCH_TRANSFORM_LIGHT
    );
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
  const toggles = document.querySelectorAll("#theme-toggle");
  toggles.forEach((toggle) => {
    const isMobileSwitch = toggle.getAttribute("data-mobile-switch") === "true";
    isMobileSwitch ? updateMobileSwitch(toggle, theme) : updateDesktopIcon(toggle, theme);
  });
}

function toggleTheme(e?: Event): void {
  e?.stopPropagation();
  const newTheme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(newTheme);

  requestAnimationFrame(() => {
    document.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme: newTheme, duration: THEME_CHANGE_DURATION },
      })
    );
  });
}

function attachToggleListeners(toggle: Element): void {
  const handler = (e: Event) => {
    e.stopPropagation();
    toggleTheme(e);
  };
  toggle.addEventListener("click", handler, { passive: false });
  toggle.addEventListener("touchend", handler, { passive: false });
}

function setupThemeToggles(): void {
  document.querySelectorAll("#theme-toggle").forEach(attachToggleListeners);
}

function setupThemePreferenceListener(): void {
  if (typeof window === "undefined") return;

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? "light" : "dark");
    }
  });

  document.addEventListener(THEME_CHANGE_EVENT, ((e: CustomEvent) => {
    updateIcon(e.detail?.theme || getTheme());
  }) as EventListener);
}

function handleAstroPageLoad(): void {
  document.addEventListener("astro:page-load", () => {
    requestAnimationFrame(() => {
      const toggles = document.querySelectorAll("#theme-toggle");
      if (toggles.length === 0) return;

      applyTheme(getTheme());
      toggles.forEach((toggle) => {
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode?.replaceChild(newToggle, toggle);
        attachToggleListeners(newToggle);
      });
    });
  });
}

export function initThemeToggle(): void {
  if (!document.getElementById("theme-toggle")) return;

  applyTheme(getTheme());
  setupThemeToggles();
  setupThemePreferenceListener();
  handleAstroPageLoad();

  requestAnimationFrame(() => {
    updateIcon(getTheme());
  });
}

