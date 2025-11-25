// Theme toggle functionality

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
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateIcon(theme);
}

function updateIcon(theme: Theme): void {
  const allToggles = document.querySelectorAll("#theme-toggle");
  if (allToggles.length === 0) return;

  allToggles.forEach((currentToggle) => {
    const isMobileSwitch =
      currentToggle.getAttribute("data-mobile-switch") === "true";
    const darkIcon = currentToggle.querySelector(".theme-icon-dark");
    const lightIcon = currentToggle.querySelector(".theme-icon-light");
    const switchKnob = currentToggle.querySelector(".theme-switch-knob");
    const switchBg = currentToggle.querySelector(".theme-switch-bg");

    if (isMobileSwitch && switchKnob) {
      if (theme === "dark") {
        (switchKnob as HTMLElement).style.transform = SWITCH_TRANSFORM_DARK;
        if (switchBg) {
          switchBg.classList.remove("bg-accent-green/20");
          switchBg.classList.add("bg-surface");
        }
      } else {
        (switchKnob as HTMLElement).style.transform = SWITCH_TRANSFORM_LIGHT;
        if (switchBg) {
          switchBg.classList.remove("bg-surface");
          switchBg.classList.add("bg-accent-green/20");
        }
      }

      if (darkIcon && lightIcon) {
        if (theme === "dark") {
          darkIcon.classList.remove("opacity-0");
          darkIcon.classList.add("opacity-100");
          lightIcon.classList.remove("opacity-100");
          lightIcon.classList.add("opacity-0");
        } else {
          darkIcon.classList.remove("opacity-100");
          darkIcon.classList.add("opacity-0");
          lightIcon.classList.remove("opacity-0");
          lightIcon.classList.add("opacity-100");
        }
      }
    } else if (darkIcon && lightIcon) {
      if (theme === "dark") {
        darkIcon.classList.remove("opacity-0", "rotate-90", "scale-0");
        darkIcon.classList.add("opacity-100", "rotate-0", "scale-100");
        lightIcon.classList.remove("opacity-100", "rotate-0", "scale-100");
        lightIcon.classList.add("opacity-0", "rotate-90", "scale-0");
      } else {
        darkIcon.classList.remove("opacity-100", "rotate-0", "scale-100");
        darkIcon.classList.add("opacity-0", "rotate-90", "scale-0");
        lightIcon.classList.remove("opacity-0", "rotate-90", "scale-0");
        lightIcon.classList.add("opacity-100", "rotate-0", "scale-100");
      }
    }
  });
}

function toggleTheme(e?: Event): void {
  if (e) {
    e.stopPropagation();
  }

  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);

  requestAnimationFrame(() => {
    document.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme: newTheme, duration: THEME_CHANGE_DURATION },
      }),
    );
  });
}

function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}

function handleThemeToggle(e: Event): void {
  e.stopPropagation();
  toggleTheme(e);
}

function setupThemeToggles(): void {
  const allToggles = document.querySelectorAll("#theme-toggle");
  allToggles.forEach((toggle) => {
    toggle.addEventListener("click", handleThemeToggle, {
      passive: false,
    });
    toggle.addEventListener("touchend", handleThemeToggle, {
      passive: false,
    });
  });
}

function setupThemePreferenceListener(): void {
  if (typeof window === "undefined") return;

  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark");
      }
    });

  document.addEventListener(THEME_CHANGE_EVENT, ((e: CustomEvent) => {
    const theme = e.detail?.theme || getTheme();
    updateIcon(theme);
  }) as EventListener);
}

function handleAstroPageLoad(): void {
  document.addEventListener("astro:page-load", () => {
    requestAnimationFrame(() => {
      const currentToggles = document.querySelectorAll("#theme-toggle");
      if (currentToggles.length > 0) {
        const theme = getTheme();
        applyTheme(theme);

        currentToggles.forEach((toggle) => {
          const newToggle = toggle.cloneNode(true);
          toggle.parentNode?.replaceChild(newToggle, toggle);

          newToggle.addEventListener("click", handleThemeToggle, {
            passive: false,
          });
          newToggle.addEventListener("touchend", handleThemeToggle, {
            passive: false,
          });
        });
      }
    });
  });
}

export function initThemeToggle(): void {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  setupThemeToggles();
  setupThemePreferenceListener();
  handleAstroPageLoad();

  requestAnimationFrame(() => {
    const currentToggles = document.querySelectorAll("#theme-toggle");
    if (currentToggles.length > 0) {
      const theme = getTheme();
      updateIcon(theme);
    }
  });
}

