const isDev = import.meta.env.DEV;
const enableDebugLogs = import.meta.env.PUBLIC_ENABLE_DEBUG_LOGS === 'true';

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev || enableDebugLogs) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]): void => {
    if (isDev) {
      console.error(...args);
    }
  },

  debug: (...args: unknown[]): void => {
    if (enableDebugLogs) {
      console.debug(...args);
    }
  },
};
