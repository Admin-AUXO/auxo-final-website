const CACHE_CLEAR_INTERVAL = 24 * 60 * 60 * 1000;
const HARD_REFRESH_KEY = 'sw-hard-refresh';
const LAST_CLEAR_KEY = 'sw-last-clear';

async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to clear caches:', error);
    }
  }
}

async function unregisterAllServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to unregister service workers:', error);
    }
  }
}

export async function clearServiceWorkerCache(): Promise<void> {
  await Promise.all([clearAllCaches(), unregisterAllServiceWorkers()]);
}

function isHardRefreshKeyPressed(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    (event.key === 'R' || event.key === 'F5' || event.keyCode === 116)
  );
}

function shouldClearPeriodically(): boolean {
  const lastClear = localStorage.getItem(LAST_CLEAR_KEY);
  if (!lastClear) return true;

  const lastClearTime = parseInt(lastClear, 10);
  const now = Date.now();
  return now - lastClearTime >= CACHE_CLEAR_INTERVAL;
}

function detectHardRefresh(): boolean {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navEntry) return false;
  
  return navEntry.type === 'reload';
}

export function setupServiceWorkerClearing(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isHardRefreshKeyPressed(event)) {
      sessionStorage.setItem(HARD_REFRESH_KEY, Date.now().toString());
    }
  };

  const handlePeriodicClear = async () => {
    if (shouldClearPeriodically()) {
      await clearServiceWorkerCache();
      localStorage.setItem(LAST_CLEAR_KEY, Date.now().toString());
      if (import.meta.env.DEV) {
        console.log('Service worker cache cleared periodically');
      }
    }
  };

  const checkHardRefreshOnLoad = async () => {
    const hardRefreshTime = sessionStorage.getItem(HARD_REFRESH_KEY);
    const isReload = detectHardRefresh();
    
    if (hardRefreshTime && isReload) {
      const refreshTime = parseInt(hardRefreshTime, 10);
      const timeSinceRefresh = Date.now() - refreshTime;
      
      if (timeSinceRefresh < 2000) {
        sessionStorage.removeItem(HARD_REFRESH_KEY);
        await clearServiceWorkerCache();
        if (import.meta.env.DEV) {
          console.log('Service worker cache cleared on hard refresh');
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkHardRefreshOnLoad();
      handlePeriodicClear();
    });
  } else {
    setTimeout(() => {
      checkHardRefreshOnLoad();
      handlePeriodicClear();
    }, 0);
  }
}

export async function forceClearServiceWorker(): Promise<void> {
  await clearServiceWorkerCache();
  localStorage.setItem(LAST_CLEAR_KEY, Date.now().toString());
  if (import.meta.env.DEV) {
    console.log('Service worker cache force cleared');
  }
}
