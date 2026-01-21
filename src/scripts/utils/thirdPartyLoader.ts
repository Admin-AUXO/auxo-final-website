interface ScriptConfig {
  src: string;
  id?: string;
  async?: boolean;
  defer?: boolean;
  type?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const loadedScripts = new Set<string>();

export function loadScript(config: ScriptConfig): Promise<void> {
  const { src, id, async = true, defer = false, type = 'text/javascript', onLoad, onError } = config;

  
  const scriptId = id || src;
  if (loadedScripts.has(scriptId)) {
    console.log(`[ThirdPartyLoader] Script already loaded: ${scriptId}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    
    if (document.querySelector(`script[src="${src}"]`)) {
      loadedScripts.add(scriptId);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    script.type = type;

    if (id) {
      script.id = id;
    }

    script.onload = () => {
      loadedScripts.add(scriptId);
      onLoad?.();
      resolve();
    };

    script.onerror = (error) => {
      const err = new Error(`Failed to load script: ${src}`);
      onError?.(err);
      reject(err);
    };

    document.head.appendChild(script);
  });
}

export function loadStylesheet(href: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    if (id) {
      link.id = id;
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  });
}


export function loadScriptOnIntersection(
  element: Element,
  config: ScriptConfig,
  options?: IntersectionObserverInit
): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadScript(config).catch(console.error);
        observer.unobserve(entry.target);
      }
    });
  }, options || { rootMargin: '200px' });

  observer.observe(element);
}


export function loadScriptOnInteraction(
  config: ScriptConfig,
  events: string[] = ['mousemove', 'scroll', 'keydown', 'click', 'touchstart']
): void {
  let loaded = false;

  const load = () => {
    if (loaded) return;
    loaded = true;

    events.forEach((event) => {
      document.removeEventListener(event, load);
    });

    loadScript(config).catch(console.error);
  };

  events.forEach((event) => {
    document.addEventListener(event, load, { once: true, passive: true });
  });

  
  setTimeout(load, 5000);
}


export function loadScriptOnIdle(config: ScriptConfig, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadScript(config).catch(console.error);
    }, { timeout });
  } else {
    setTimeout(() => {
      loadScript(config).catch(console.error);
    }, timeout);
  }
}


export function isScriptLoaded(src: string): boolean {
  return loadedScripts.has(src) || !!document.querySelector(`script[src="${src}"]`);
}


export function removeScript(src: string): void {
  const script = document.querySelector(`script[src="${src}"]`);
  if (script) {
    script.remove();
    loadedScripts.delete(src);
  }
}


export function preconnect(domain: string, crossorigin: boolean = false): void {
  const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;

  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}


export function dnsPrefetch(domain: string): void {
  const existing = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;

  document.head.appendChild(link);
}
