import { createClient, type SanityClient } from '@sanity/client';

const projectId = (import.meta.env.SANITY_PROJECT_ID || import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '4ddas0r0') as string;
const dataset = (import.meta.env.SANITY_DATASET || import.meta.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production') as string;
const token = import.meta.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN;

const finalProjectId = projectId || '4ddas0r0';
const finalDataset = dataset || 'production';

let sanityClient: SanityClient;
try {
  sanityClient = createClient({
    projectId: finalProjectId,
    dataset: finalDataset,
    useCdn: import.meta.env.PROD,
    apiVersion: '2025-01-03',
    token,
    requestTagPrefix: 'auxo-website',
    perspective: import.meta.env.PROD ? 'published' : 'raw',
    stega: false,
  });

  if (import.meta.env.DEV) {
    console.log('Sanity client initialized with project:', `${finalProjectId?.slice(0, 4) || 'unknown'}...`);
  }
} catch (error) {
  console.error('Failed to initialize Sanity client:', error);
  sanityClient = createClient({
    projectId: '4ddas0r0',
    dataset: 'production',
    useCdn: false,
  });
}

export { sanityClient };
