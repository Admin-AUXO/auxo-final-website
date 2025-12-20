interface Window {
  lenis?: import('lenis').Lenis;
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}
