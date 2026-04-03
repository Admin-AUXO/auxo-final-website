const stylesheetPromises = new Map<string, Promise<void>>();

function waitForStylesheet(link: HTMLLinkElement, href: string): Promise<void> {
  if (link.dataset.loaded === 'true' || !!link.sheet) {
    link.dataset.loaded = 'true';
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
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
  });
}

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
    const pending = waitForStylesheet(existingLink, href);
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

    void waitForStylesheet(link, href).then(resolve).catch(reject);
    document.head.appendChild(link);
  });

  stylesheetPromises.set(cacheKey, promise);
  return promise;
}
