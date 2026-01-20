import { env } from '@/config/env';

export const logger = {
  log: (...args: unknown[]): void => {
    if (env.isDev || env.logging.enableDebug) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (env.isDev) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]): void => {
    if (env.isDev) {
      console.error(...args);
    }
  },

  debug: (...args: unknown[]): void => {
    if (env.logging.enableDebug) {
      console.debug(...args);
    }
  },
};
