import { BREAKPOINTS } from "../constants";

let cachedIsMobile: boolean | null = null;
let cachedIsTouch: boolean | null = null;

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedIsMobile !== null) return cachedIsMobile;

  const userAgent = navigator.userAgent || "";
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );

  const isMobileHint = navigator.userAgentData?.mobile;

  cachedIsMobile =
    isMobileHint ??
    (window.innerWidth < BREAKPOINTS.MD ||
      (isMobileUA && window.innerWidth < BREAKPOINTS.LG));

  return Boolean(cachedIsMobile);
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedIsTouch !== null) return cachedIsTouch;

  cachedIsTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator.msMaxTouchPoints ?? 0) > 0;

  return cachedIsTouch;
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    () => {
      cachedIsMobile = null;
      cachedIsTouch = null;
    },
    { passive: true },
  );
}
