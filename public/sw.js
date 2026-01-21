const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `auxo-${CACHE_VERSION}`;

const CRITICAL_CACHE = `${CACHE_NAME}-critical`;
const PAGE_CACHE = `${CACHE_NAME}-pages`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const ASSET_CACHE = `${CACHE_NAME}-assets`;

const CRITICAL_ASSETS = [
  '/',
  '/offline',
  '/fonts/PlusJakartaSans-VariableFont_wght.woff2',
  '/favicon.svg',
  '/logo.svg',
];

const CACHE_EXPIRATION = {
  pages: 86400, // 24 hours
  images: 604800, // 7 days
  assets: 2592000, // 30 days
};


self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CRITICAL_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[ServiceWorker] Install failed:', error);
    })
  );
});


self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('auxo-') && !cacheName.startsWith(CACHE_NAME)) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});


self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  
  if (request.method !== 'GET') {
    return;
  }

  
  if (url.origin !== location.origin ||
      url.pathname.includes('/api/') ||
      url.hostname.includes('google-analytics.com') ||
      url.hostname.includes('googletagmanager.com')) {
    return;
  }

  event.respondWith(handleFetch(request, url));
});

async function handleFetch(request, url) {
  
  if (request.headers.get('accept')?.includes('text/html')) {
    return networkFirst(request, PAGE_CACHE);
  }

  
  if (request.headers.get('accept')?.includes('image')) {
    return cacheFirst(request, IMAGE_CACHE, CACHE_EXPIRATION.images);
  }

  
  if (url.pathname.includes('/fonts/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff2')) {
    return cacheFirst(request, ASSET_CACHE, CACHE_EXPIRATION.assets);
  }

  
  if (url.pathname.endsWith('.js')) {
    return networkFirst(request, ASSET_CACHE);
  }

  
  return networkFirst(request, ASSET_CACHE);
}


async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline');
    }

    throw error;
  }
}


async function cacheFirst(request, cacheName, maxAge) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    
    if (maxAge) {
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const age = (now - cachedDate) / 1000;

      if (age > maxAge) {
        
        return fetchAndCache(request, cacheName);
      }
    }

    return cachedResponse;
  }

  return fetchAndCache(request, cacheName);
}

async function fetchAndCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}


self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-submission') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncFormSubmissions() {
  const cache = await caches.open('form-submissions');
  const requests = await cache.keys();

  return Promise.all(
    requests.map(async (request) => {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('[ServiceWorker] Form synced:', request.url);
      } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
      }
    })
  );
}


self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('auxo-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});


self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCache());
  }
});

async function cleanupExpiredCache() {
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    if (!cacheName.startsWith(CACHE_NAME)) {
      continue;
    }

    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedDate = new Date(response.headers.get('date'));
        const now = new Date();
        const age = (now - cachedDate) / 1000;

        
        if (age > 2592000) {
          await cache.delete(request);
          console.log('[ServiceWorker] Removed expired cache:', request.url);
        }
      }
    }
  }
}
