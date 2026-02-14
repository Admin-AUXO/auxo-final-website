export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  analytics: {
    measurementId: import.meta.env.PUBLIC_GA4_MEASUREMENT_ID || 'G-WBMKHRWS7Z',
    debug: import.meta.env.DEV || import.meta.env.PUBLIC_GA4_DEBUG === 'true',
  },

  emailjs: {
    serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID || '',
    templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID || '',
    publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || '',
  },

  logging: {
    enableDebug: import.meta.env.PUBLIC_ENABLE_DEBUG_LOGS === 'true',
  },

  site: {
    url: import.meta.env.SITE || 'https://auxodata.com',
  },
} as const;

export type Environment = typeof env;
