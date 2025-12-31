export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        e.preventDefault();
        scrollToElement(target, { offset: 0 });
      }
    }, { passive: false });
  });

  document.addEventListener('astro:page-load', () => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const target = document.querySelector(hash) as HTMLElement;
          if (target) {
            scrollToElement(target, { offset: 0 });
          }
        }, 150);
      });
    }
  });
}

export function stopSmoothScroll() {
  // No-op
}

export function startSmoothScroll() {
  // No-op
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) {
  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (!element) return;

  const offset = options?.offset || 0;

  if (options?.immediate) {
    element.scrollIntoView({
      behavior: 'instant',
      block: 'start'
    });
    return;
  }

  if ('scrollBehavior' in document.documentElement.style) {
    try {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } catch (error) {
      fallbackScroll(element, offset);
    }
  } else {
    fallbackScroll(element, offset);
  }
}

function fallbackScroll(element: HTMLElement, offset: number) {
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  const startPosition = window.pageYOffset;
  const distance = offsetPosition - startPosition;

  if (Math.abs(distance) < 1) return;

  const duration = Math.min(Math.max(Math.abs(distance) / 2, 300), 1000);
  let startTime: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    const easeProgress = easeInOutCubic(progress);
    const currentPosition = startPosition + (distance * easeProgress);

    window.scrollTo(0, currentPosition);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export function destroySmoothScroll() {
  // No-op
}

export function isSmoothScrollEnabled(): boolean {
  return true;
}
