import { BREAKPOINTS } from "../core/constants";

let cachedIsMobile: boolean | null = null;

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

if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    () => {
      cachedIsMobile = null;
    },
    { passive: true },
  );
}
