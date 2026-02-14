import type { SiteConfig } from '@/data/content/siteConfig';
import { siteConfig as data } from '@/data/content/siteConfig-data.js';

export async function getSiteConfig(): Promise<SiteConfig> {
  return data;
}
