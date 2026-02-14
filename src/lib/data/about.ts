import type { AboutContent } from '@/data/content/about';
import { aboutContent as data } from '@/data/content/about-data.js';

export async function getAboutContent(): Promise<AboutContent> {
  return data;
}
