import type { HomepageContent } from '@/data/content/homepage';
import { homepageContent as data } from '@/data/content/homepage-data.js';

export async function getHomepageContent(): Promise<HomepageContent> {
  return data;
}
