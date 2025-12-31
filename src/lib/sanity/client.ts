import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID || '4ddas0r0';
const dataset = import.meta.env.SANITY_DATASET || 'production';
const token = import.meta.env.SANITY_API_TOKEN;

// Create Sanity client with default configuration
const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: import.meta.env.PROD,
  apiVersion: '2024-01-01',
  token,
  requestTagPrefix: 'auxo-website',
  perspective: import.meta.env.PROD ? 'published' : 'raw',
  stega: false,
});

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('Sanity client initialized with project:', `${projectId.slice(0, 4)}...`);
}

export { sanityClient };
