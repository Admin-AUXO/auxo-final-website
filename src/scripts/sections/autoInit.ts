import { CAROUSEL_CONFIGS, initCarouselById } from "./utils/carouselConfigs";

const initializedContainers = new Set<string>();

export function autoInitCarousels(): void {
  if (typeof document === 'undefined') return;

  CAROUSEL_CONFIGS.forEach(({ containerId }) => {
    if (initializedContainers.has(containerId)) return;

    const container = document.getElementById(containerId);
    if (container) {
      initializedContainers.add(containerId);
      initCarouselById(containerId);
    }
  });
}

export function resetAutoInitState(): void {
  initializedContainers.clear();
}

if (typeof window !== 'undefined') {
  (window as any).autoInitCarousels = autoInitCarousels;
}
