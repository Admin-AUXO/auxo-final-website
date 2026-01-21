const SW_PATH = '/sw.js';
const SW_UPDATE_INTERVAL = 60 * 60 * 1000; // Check for updates every hour

let registration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[ServiceWorker] Not supported');
    return;
  }

  try {
    registration = await navigator.serviceWorker.register(SW_PATH);
    console.log('[ServiceWorker] Registered:', registration.scope);

  
    registration.update();

  
    setInterval(() => {
      registration?.update();
    }, SW_UPDATE_INTERVAL);

  
    registration.addEventListener('updatefound', handleUpdate);

  
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[ServiceWorker] Controller changed, reloading...');
      window.location.reload();
    });

  
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'service_worker_registered');
    }
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'service_worker_error', {
        error: String(error),
      });
    }
  }
}

function handleUpdate() {
  if (!registration) return;

  const newWorker = registration.installing;
  if (!newWorker) return;

  console.log('[ServiceWorker] Update found');

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    
      showUpdateNotification();

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'service_worker_update_available');
      }
    }
  });
}

function showUpdateNotification() {

  const notification = document.createElement('div');
  notification.className = 'sw-update-notification';
  notification.innerHTML = `
    <div class="sw-update-content">
      <p class="sw-update-message">A new version is available!</p>
      <div class="sw-update-actions">
        <button class="sw-update-btn" aria-label="Update now">Update</button>
        <button class="sw-dismiss-btn" aria-label="Dismiss">Later</button>
      </div>
    </div>
  `;


  const style = document.createElement('style');
  style.textContent = `
    .sw-update-notification {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      max-width: 400px;
      background: var(--bg-card);
      border: 2px solid var(--accent-green);
      border-radius: 0.75rem;
      padding: 1.25rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      animation: slideUp 0.4s ease;
    }

    .sw-update-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sw-update-message {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .sw-update-actions {
      display: flex;
      gap: 0.75rem;
    }

    .sw-update-btn,
    .sw-dismiss-btn {
      flex: 1;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid;
    }

    .sw-update-btn {
      background: var(--accent-green);
      color: var(--bg-primary);
      border-color: var(--accent-green);
    }

    .sw-update-btn:hover {
      background: transparent;
      color: var(--accent-green);
    }

    .sw-dismiss-btn {
      background: transparent;
      color: var(--text-secondary);
      border-color: var(--border-theme);
    }

    .sw-dismiss-btn:hover {
      color: var(--text-primary);
      border-color: var(--text-primary);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(2rem);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @media (max-width: 640px) {
      .sw-update-notification {
        left: 1rem;
        right: 1rem;
        transform: none;
        max-width: none;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(2rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);


  const updateBtn = notification.querySelector('.sw-update-btn');
  updateBtn?.addEventListener('click', () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    notification.remove();

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'service_worker_updated');
    }
  });


  const dismissBtn = notification.querySelector('.sw-dismiss-btn');
  dismissBtn?.addEventListener('click', () => {
    notification.remove();
  });


  setTimeout(() => {
    notification.remove();
  }, 30000);
}

export async function unregisterServiceWorker(): Promise<void> {
  if (!registration) return;

  try {
    const success = await registration.unregister();
    console.log('[ServiceWorker] Unregistered:', success);

  
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );

    console.log('[ServiceWorker] Caches cleared');
  } catch (error) {
    console.error('[ServiceWorker] Unregister failed:', error);
  }
}

export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return registration;
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}
