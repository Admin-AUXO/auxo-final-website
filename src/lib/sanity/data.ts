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
import type { Language } from '@/i18n';
import { logger } from '@/lib/logger';

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

export async function getHomepageContent(lang: Language = 'en'): Promise<HomepageContent> {
  return sanityCache.get(`homepage:${lang}`, async () => {
    const data = await sanityClient!.fetch<HomepageContent>(homepageQuery, { lang });
    if (!data) {
      throw new Error('No homepage content found in Sanity');
    }
    return {
      hero: {
        title: data.hero?.title || '',
        titleHighlight: data.hero?.titleHighlight || '',
        subtitle: data.hero?.subtitle || '',
        subtitleHighlight: data.hero?.subtitleHighlight,
        primaryCta: data.hero?.primaryCta || { text: '', href: '' },
        scrollIndicator: data.hero?.scrollIndicator || '',
      },
      valueProposition: {
        line1: data.valueProposition?.line1 || '',
        line2: data.valueProposition?.line2 || '',
      },
      finalCta: {
        title: data.finalCta?.title || '',
        subtitle: data.finalCta?.subtitle || '',
        ctaText: data.finalCta?.ctaText || '',
        ctaHref: data.finalCta?.ctaHref || '',
        body: data.finalCta?.body || '',
        bodyHighlight: data.finalCta?.bodyHighlight,
        reassuranceLine: data.finalCta?.reassuranceLine || '',
      },
      methodology: {
        title: data.methodology?.title || '',
        titleHighlight: data.methodology?.titleHighlight || '',
        subtitle: data.methodology?.subtitle || '',
        steps: data.methodology?.steps?.filter(Boolean) || [],
        navigationButton: data.methodology?.navigationButton,
      },
      capabilities: {
        title: data.capabilities?.title || '',
        subheading: data.capabilities?.subheading || '',
        cards: data.capabilities?.cards?.filter(Boolean) || [],
      },
      featuredServices: {
        title: data.featuredServices?.title || '',
        subheading: data.featuredServices?.subheading || '',
        items: (data.featuredServices?.items || []).filter((item: any) => item && (item.title || item.description)),
        navigationButton: data.featuredServices?.navigationButton || { text: '', href: '' },
      },
      techStack: {
        title: data.techStack?.title || '',
        subtitle: data.techStack?.subtitle || '',
        items: data.techStack?.items?.filter(Boolean) || [],
      },
    };
  });
}

export async function getServicesContent(lang: Language = 'en'): Promise<ServicesContent> {
  return sanityCache.get(`services:${lang}`, async () => {
    try {
      const [generalData, detailsData] = await Promise.all([
        sanityClient!.fetch<Omit<ServicesContent, 'details'>>(servicesQuery, { lang }),
        sanityClient!.fetch<ServiceDetail[]>(serviceDetailsQuery, { lang }),
      ]);

      if (!generalData) {
        logger.error('Services query returned null/undefined');
        logger.error('Query:', servicesQuery);
        const testQuery = await sanityClient!.fetch('*[_type == "services"][0]{_id,_type}');
        logger.error('Test query result:', testQuery);
        throw new Error('No services content found in Sanity');
      }

      return {
      hero: generalData.hero || {
        headlineLine1: '',
        headlineLine2: '',
        description: '',
      },
      serviceOfferings: {
        title: generalData.serviceOfferings?.title || '',
        description: generalData.serviceOfferings?.description || '',
        descriptionHighlight: generalData.serviceOfferings?.descriptionHighlight,
        services: generalData.serviceOfferings?.services?.filter(Boolean) || [],
        codeEdge: generalData.serviceOfferings?.codeEdge || '',
        codeEdgeHighlight: generalData.serviceOfferings?.codeEdgeHighlight,
      },
      impact: {
        title: generalData.impact?.title || '',
        description: generalData.impact?.description || '',
        descriptionHighlight: generalData.impact?.descriptionHighlight,
        industries: generalData.impact?.industries?.filter(Boolean) || [],
        goal: generalData.impact?.goal || '',
        goalHighlight: generalData.impact?.goalHighlight,
      },
      engagementModels: {
        title: generalData.engagementModels?.title || '',
        description: generalData.engagementModels?.description || '',
        descriptionHighlight: generalData.engagementModels?.descriptionHighlight,
        models: generalData.engagementModels?.models?.filter(Boolean) || [],
      },
      cta: generalData.cta || {
        title: '',
        description: '',
        ctaText: '',
        ctaHref: '',
      },
      details: detailsData || [],
    };
    } catch (error) {
      logger.error('Error fetching services content:', error);
      throw error;
    }
  });
}

export async function getServiceDetailBySlug(slug: string, lang: Language = 'en'): Promise<ServiceDetail | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  return sanityCache.get(`service:${slug}:${lang}`, async () => {
    try {
      const data = await sanityClient!.fetch<ServiceDetail>(serviceDetailBySlugQuery, { slug, lang });
      return data || null;
    } catch (error) {
      logger.error(`Service detail fetch failed for "${slug}":`, error);
      return null;
    }
  });
}

export async function getAboutContent(lang: Language = 'en'): Promise<AboutContent> {
  return fetchWithError<AboutContent>(aboutQuery, `about:${lang}`, 'No about content found in Sanity', { lang });
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return fetchWithError<SiteConfig>(siteConfigQuery, 'siteConfig', 'No site configuration found in Sanity');
}

export async function getFooterContent(lang: Language = 'en'): Promise<FooterContent> {
  return fetchWithError<FooterContent>(footerQuery, `footer:${lang}`, 'No footer content found in Sanity', { lang });
}

export async function getNavigationContent(lang: Language = 'en'): Promise<NavigationContent> {
  return fetchWithError<NavigationContent>(navigationQuery, `navigation:${lang}`, 'No navigation content found in Sanity', { lang });
}

