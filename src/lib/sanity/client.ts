import { createClient } from '@sanity/client';

// Default configuration - will be overridden by environment variables if available
const projectId = '4ddas0r0';
const dataset = 'production';
const token = 'sk7boAumpQ37aU9QUJKQ7qqB4CleS9iGbCVrKQmQeBoTOoLapAeRoZyWMidX4XZh4mCoZaaOgoj0nb6QAOncF45U5Jc2A4A0ZEvE3vKFDeDSsiHM6GMfwBkhMHJnYLRECjNP6hqIz7PePRfWZB1q4ncL2Rp1zhcW84Xb3tnrAXTXwyq4kmo7';

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
