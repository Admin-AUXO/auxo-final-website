import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || 'production';
const token = import.meta.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error('Sanity configuration missing. Required: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: import.meta.env.PROD,
  apiVersion: '2025-02-19',
  token,
  requestTagPrefix: 'auxo-website',
  perspective: 'published',
  stega: false,
});
