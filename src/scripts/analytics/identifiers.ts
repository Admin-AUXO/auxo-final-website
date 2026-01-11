import { logger } from '@/lib/logger';

const CLIENT_ID_KEY = 'auxo_ga_client_id';
const SESSION_ID_KEY = 'auxo_session_id';
const SESSION_NUMBER_KEY = 'auxo_session_number';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function generateId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
}

export function getClientId(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';

  try {
    let clientId = localStorage.getItem(CLIENT_ID_KEY);

    if (!clientId) {
      clientId = generateId();
      localStorage.setItem(CLIENT_ID_KEY, clientId);
      logger.log('[Analytics] New client ID generated:', clientId);
    }

    return clientId;
  } catch (error) {
    logger.error('[Analytics] Failed to get/set client ID:', error);
    return generateId();
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return '';

  try {
    const stored = sessionStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const { id, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < SESSION_TIMEOUT_MS) {
        return id;
      }
    }

    const newSessionId = generateId();
    sessionStorage.setItem(SESSION_ID_KEY, JSON.stringify({
      id: newSessionId,
      timestamp: Date.now(),
    }));

    incrementSessionNumber();
    logger.log('[Analytics] New session ID generated:', newSessionId);

    return newSessionId;
  } catch (error) {
    logger.error('[Analytics] Failed to get/set session ID:', error);
    return generateId();
  }
}

export function getSessionNumber(): number {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return 1;

  try {
    const stored = localStorage.getItem(SESSION_NUMBER_KEY);
    return stored ? parseInt(stored, 10) : 1;
  } catch {
    return 1;
  }
}

function incrementSessionNumber(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  try {
    const current = getSessionNumber();
    localStorage.setItem(SESSION_NUMBER_KEY, (current + 1).toString());
  } catch (error) {
    logger.error('[Analytics] Failed to increment session number:', error);
  }
}

export function updateSessionTimestamp(): void {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;

  try {
    const stored = sessionStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      session.timestamp = Date.now();
      sessionStorage.setItem(SESSION_ID_KEY, JSON.stringify(session));
    }
  } catch (error) {
    logger.error('[Analytics] Failed to update session timestamp:', error);
  }
}

export function getGA4ClientId(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(getClientId());
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const checkGA4 = () => {
      if (window.gtag && typeof window.gtag === 'function') {
        window.gtag('get', 'G-WBMKHRWS7Z', 'client_id', (clientId: string) => {
          if (clientId) {
            resolve(clientId);
          } else {
            resolve(getClientId());
          }
        });
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkGA4, 100);
        } else {
          resolve(getClientId());
        }
      }
    };

    checkGA4();
  });
}

export function initIdentifiers(): void {
  getClientId();
  getSessionId();

  if (typeof window !== 'undefined') {
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateSessionTimestamp, { once: true, passive: true });
    });
  }
}
