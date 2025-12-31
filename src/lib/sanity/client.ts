import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '4ddas0r0';
const dataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const token = import.meta.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN || 'sk7boAumpQ37aU9QUJKQ7qqB4CleS9iGbCVrKQmQeBoTOoLapAeRoZyWMidX4XZh4mCoZaaOgoj0nb6QAOncF45U5Jc2A4A0ZEvE3vKFDeDSsiHM6GMfwBkhMHJnYLRECjNP6hqIz7PePRfWZB1q4ncL2Rp1zhcW84Xb3tnrAXTXwyq4kmo7';

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('Sanity client initialized:', {
    projectId: `${projectId.slice(0, 4)}...`,
    dataset,
    hasToken: !!token
  });
}

// Create client only if we have the required configuration
let sanityClient: ReturnType<typeof createClient> | null = null;

if (projectId && dataset) {
  sanityClient = createClient({
    projectId,
    dataset,
    useCdn: import.meta.env.PROD,
    apiVersion: import.meta.env.SANITY_API_VERSION || '2024-01-01',
    token,
    requestTagPrefix: 'auxo-website',
    perspective: import.meta.env.PROD ? 'published' : 'raw',
    stega: false,
  });
} else if (import.meta.env.DEV) {
  console.error('Sanity client not created: missing projectId or dataset', {
    projectId: !!projectId,
    dataset: !!dataset
  });
}

export { sanityClient };
