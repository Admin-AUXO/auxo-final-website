import type { ServicesContent, ServiceDetail } from '@/data/content/services/types';

let cachedServicesContent: ServicesContent | null = null;

export async function getServicesContent(): Promise<ServicesContent> {
  if (!cachedServicesContent) {
    const { servicesContent } = await import('@/data/content/services/data.js');
    cachedServicesContent = servicesContent;
  }
  return cachedServicesContent!;
}

export async function getServiceDetailBySlug(slug: string): Promise<ServiceDetail | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }
  
  const content = await getServicesContent();
  const service = content.details.find(d => d.slug === slug);
  return service || null;
}
