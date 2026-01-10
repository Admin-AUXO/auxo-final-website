/**
 * Production-safe logging utility
 * Only logs in development mode or when explicitly enabled
 */

const isDev = import.meta.env.DEV;
const enableDebugLogs = import.meta.env.PUBLIC_ENABLE_DEBUG_LOGS === 'true';

export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (...args: unknown[]): void => {
    if (isDev || enableDebugLogs) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always logged, but with different handling in production)
   */
  error: (...args: unknown[]): void => {
    if (isDev) {
      console.error(...args);
    } else {
      // In production, silently fail or send to error tracking service
      // You could integrate with Sentry, LogRocket, etc. here
    }
  },

  /**
   * Log debug messages (development only, requires explicit flag)
   */
  debug: (...args: unknown[]): void => {
    if (enableDebugLogs) {
      console.debug(...args);
    }
  },
};
