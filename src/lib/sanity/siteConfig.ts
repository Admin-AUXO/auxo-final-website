import { getSiteConfig } from './data';
import type { SiteConfig } from '@/data/content/siteConfig';

export type SiteData = {
  name: string;
  author: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: null;
  address: {
    street: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  social: {
    linkedin: string;
    twitter: string;
  };
  founded: number;
  stats: {
    yearsExperience: string;
    technologiesMastered: string;
    industriesServed: string;
    foundingClients: string;
    responseTime: string;
  };
  privacyEmail: string;
  themeColor: string;
};

export async function getSiteConfigData(): Promise<SiteData> {
  const config = await getSiteConfig();
  return {
    name: config.name,
    author: config.name,
    tagline: config.tagline,
    description: config.description,
    url: config.url,
    email: config.email,
    phone: null,
    address: {
      street: config.address.street,
      city: config.address.city,
      country: config.address.country,
      coordinates: {
        lat: config.address.lat,
        lng: config.address.lng,
      },
    },
    social: config.social,
    founded: 2025,
    stats: config.stats,
    privacyEmail: config.privacyEmail,
    themeColor: '#000000',
  };
}
