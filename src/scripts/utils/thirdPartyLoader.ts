const stylesheetPromises = new Map<string, Promise<void>>();

export function loadStylesheet(href: string, id?: string): Promise<void> {
  const cacheKey = id || href;
  const cachedPromise = stylesheetPromises.get(cacheKey);
  if (cachedPromise) return cachedPromise;

  const existingLinkById = id
    ? (document.getElementById(id) as HTMLLinkElement | null)
    : null;
  const existingLinkByHref = document.querySelector(
    `link[rel="stylesheet"][href="${href}"]`,
  ) as HTMLLinkElement | null;
  const existingLink = existingLinkById || existingLinkByHref;

  if (existingLink) {
    if (existingLink.dataset.loaded === 'true' || !!existingLink.sheet) {
      existingLink.dataset.loaded = 'true';
      const resolved = Promise.resolve();
      stylesheetPromises.set(cacheKey, resolved);
      return resolved;
    }

    const pending = new Promise<void>((resolve, reject) => {
      existingLink.addEventListener(
        'load',
        () => {
          existingLink.dataset.loaded = 'true';
          resolve();
        },
        { once: true },
      );
      existingLink.addEventListener(
        'error',
        () => reject(new Error(`Failed to load stylesheet: ${href}`)),
        { once: true },
      );
    });

    stylesheetPromises.set(cacheKey, pending);
    return pending;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.loaded = 'false';

    if (id) {
      link.id = id;
    }

    link.addEventListener(
      'load',
      () => {
        link.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    link.addEventListener(
      'error',
      () => reject(new Error(`Failed to load stylesheet: ${href}`)),
      { once: true },
    );

    document.head.appendChild(link);
  });

  stylesheetPromises.set(cacheKey, promise);
  return promise;
}
