import { createClient, type SanityClient } from '@sanity/client';
import { logger } from '@/lib/logger';
import { env } from '@/config/env';

let sanityClient: SanityClient;
try {
  sanityClient = createClient({
    projectId: env.sanity.projectId,
    dataset: env.sanity.dataset,
    useCdn: env.sanity.useCdn,
    apiVersion: env.sanity.apiVersion,
    token: env.sanity.token,
    requestTagPrefix: 'auxo-website',
    perspective: env.sanity.perspective,
    stega: false,
  });

  logger.log('Sanity client initialized with project:', `${env.sanity.projectId?.slice(0, 4) || 'unknown'}...`);
} catch (error) {
  logger.error('Failed to initialize Sanity client:', error);
  sanityClient = createClient({
    projectId: '4ddas0r0',
    dataset: 'production',
    useCdn: false,
  });
}

export { sanityClient };
