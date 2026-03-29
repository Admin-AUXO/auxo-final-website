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
  const scrollableHeight = getScrollHeight() - getViewportHeight();
  return scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
}
