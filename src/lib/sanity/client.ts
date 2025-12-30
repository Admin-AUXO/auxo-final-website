import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const token = import.meta.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN;

// Create client only if we have the required configuration
let sanityClient: ReturnType<typeof createClient> | null = null;

if (projectId && dataset) {
  sanityClient = createClient({
  projectId,
  dataset,
  useCdn: import.meta.env.PROD,
  apiVersion: '2024-01-01',
  token,
  requestTagPrefix: 'auxo-website',
  perspective: import.meta.env.PROD ? 'published' : 'raw',
  stega: false,
});
}

export { sanityClient };
