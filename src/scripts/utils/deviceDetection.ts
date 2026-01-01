import { BREAKPOINTS } from '../constants';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.innerWidth < BREAKPOINTS.MD ||
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth < BREAKPOINTS.LG)
  );
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}
