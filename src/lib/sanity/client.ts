import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || 'production';
const token = import.meta.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error('Missing Sanity configuration: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: import.meta.env.PROD,
  apiVersion: '2024-01-01',
  token,
  requestTagPrefix: 'auxo-website',
  perspective: import.meta.env.PROD ? 'published' : 'raw',
  stega: false,
});
