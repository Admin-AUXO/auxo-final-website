export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  sanity: {
    projectId: (import.meta.env.SANITY_PROJECT_ID ||
                import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
                '4ddas0r0') as string,
    dataset: (import.meta.env.SANITY_DATASET ||
              import.meta.env.PUBLIC_SANITY_DATASET ||
              'production') as string,
    token: import.meta.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: import.meta.env.PROD,
    perspective: import.meta.env.PROD ? 'published' as const : 'raw' as const,
  },

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
