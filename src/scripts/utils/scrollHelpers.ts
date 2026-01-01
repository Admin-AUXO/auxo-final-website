export function getScrollTop(): number {
  const lenis = (window as any).__lenis;
  return lenis?.scroll ?? window.scrollY ?? document.documentElement.scrollTop;
}

export function getScrollHeight(): number {
  return document.documentElement.scrollHeight;
}

export function getViewportHeight(): number {
  return window.innerHeight ?? document.documentElement.clientHeight;
}

export function getScrollPercentage(): number {
  const scrollTop = getScrollTop();
  const scrollHeight = getScrollHeight();
  const viewportHeight = getViewportHeight();

  const scrollableHeight = scrollHeight - viewportHeight;
  return scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
}

export function isScrolledPast(threshold: number): boolean {
  return getScrollTop() > threshold;
}

export function scrollToTop(smooth: boolean = true): void {
  if (smooth) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo(0, 0);
  }
}

export function scrollToElement(element: HTMLElement | null, offset: number = 0): void {
  if (!element) return;

  // Batch DOM reads first to avoid forced reflows
  const boundingRect = element.getBoundingClientRect();
  const scrollTop = getScrollTop();

  const elementPosition = boundingRect.top + scrollTop;
  const offsetPosition = elementPosition - offset;

  // Perform DOM write operations after reads
  requestAnimationFrame(() => {
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  });
}
