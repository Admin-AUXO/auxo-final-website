export function isViewTransitionsSupported(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function performTransition(updateCallback: () => void | Promise<void>): void {
  if (!isViewTransitionsSupported()) {
    // Fallback for browsers without View Transitions API
    document.documentElement.classList.add('transitioning');

    Promise.resolve(updateCallback()).then(() => {
      setTimeout(() => {
        document.documentElement.classList.remove('transitioning');
      }, 200);
    });
    return;
  }

  // Use View Transitions API
  (document as any).startViewTransition(async () => {
    await updateCallback();
  });
}

export function setTransitionName(element: Element, name: string): void {
  if (element instanceof HTMLElement) {
    element.style.viewTransitionName = name;
  }
}

export function removeTransitionName(element: Element): void {
  if (element instanceof HTMLElement) {
    element.style.viewTransitionName = '';
  }
}

export function setupPageTransitions(): void {
  if (!isViewTransitionsSupported()) {
    console.log('[ViewTransitions] Not supported, using fallback');
    return;
  }

  // Set view transition names for key elements
  const main = document.querySelector('main');
  const header = document.querySelector('header');

  if (main) {
    setTransitionName(main, 'main-content');
  }

  if (header) {
    setTransitionName(header, 'navigation');
  }

  // Track analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_transitions_enabled');
  }
}

export function cleanupPageTransitions(): void {
  const main = document.querySelector('main');
  const header = document.querySelector('header');

  if (main) {
    removeTransitionName(main);
  }

  if (header) {
    removeTransitionName(header);
  }
}


export function preserveScrollPosition(): void {
  const scrollY = window.scrollY;

  document.addEventListener('astro:after-swap', () => {
    window.scrollTo(0, scrollY);
  }, { once: true });
}


export function skipTransition(link: HTMLAnchorElement): void {
  link.addEventListener('click', (e) => {
    if (isViewTransitionsSupported()) {
      e.preventDefault();
      window.location.href = link.href;
    }
  });
}


export function initAstroViewTransitions(): void {
  document.addEventListener('astro:before-preparation', () => {
    setupPageTransitions();
  });

  document.addEventListener('astro:after-swap', () => {
    setupPageTransitions();
  });

  document.addEventListener('astro:page-load', () => {
    setupPageTransitions();
  });

  // Initial setup
  setupPageTransitions();
}


export function destroyAstroViewTransitions(): void {
  cleanupPageTransitions();
}
