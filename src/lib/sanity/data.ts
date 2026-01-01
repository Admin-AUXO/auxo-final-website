import { sanityClient } from './client';
import { sanityCache } from './cache';
import {
  homepageQuery,
  servicesQuery,
  serviceDetailsQuery,
  serviceDetailBySlugQuery,
  aboutQuery,
  siteConfigQuery,
  footerQuery,
  navigationQuery,
} from './queries';
import type { HomepageContent } from '@/data/content/homepage';
import type { ServicesContent, ServiceDetail } from '@/data/content/services/types';
import type { AboutContent } from '@/data/content/about';
import type { SiteConfig } from '@/data/content/siteConfig';
import type { FooterContent } from '@/data/content/footer';
import type { NavigationContent } from '@/data/content/navigation';

const fetchWithError = async <T>(
  query: string,
  cacheKey: string,
  errorMsg: string,
  params?: Record<string, unknown>
): Promise<T> => {
  return sanityCache.get(cacheKey, async () => {
    const data = await sanityClient!.fetch<T>(query, params || {});
    if (!data) {
      throw new Error(errorMsg);
    }
    return data;
  });
};

export async function getHomepageContent(): Promise<HomepageContent> {
  return fetchWithError<HomepageContent>(homepageQuery, 'homepage', 'No homepage content found in Sanity');
}

export async function getServicesContent(): Promise<ServicesContent> {
  return sanityCache.get('services', async () => {
    const [generalData, detailsData] = await Promise.all([
      sanityClient!.fetch<Omit<ServicesContent, 'details'>>(servicesQuery),
      sanityClient!.fetch<ServiceDetail[]>(serviceDetailsQuery),
    ]);

    if (!generalData) {
      throw new Error('No services content found in Sanity');
    }

    return {
      ...generalData,
      details: detailsData || [],
    };
  });
}

export async function getServiceDetailBySlug(slug: string): Promise<ServiceDetail | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  return sanityCache.get(`service:${slug}`, async () => {
    try {
      const data = await sanityClient!.fetch<ServiceDetail>(serviceDetailBySlugQuery, { slug });
      return data || null;
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Service detail fetch failed for "${slug}":`, error);
      return null;
    }
  });
}

export async function getAboutContent(): Promise<AboutContent> {
  return fetchWithError<AboutContent>(aboutQuery, 'about', 'No about content found in Sanity');
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return fetchWithError<SiteConfig>(siteConfigQuery, 'siteConfig', 'No site configuration found in Sanity');
}

export async function getFooterContent(): Promise<FooterContent> {
  return fetchWithError<FooterContent>(footerQuery, 'footer', 'No footer content found in Sanity');
}

export async function getNavigationContent(): Promise<NavigationContent> {
  return fetchWithError<NavigationContent>(navigationQuery, 'navigation', 'No navigation content found in Sanity');
}

