import type { FooterContent } from '@/data/content/footer';
import { footerContent as data } from '@/data/content/footer-data.js';

export async function getFooterContent(): Promise<FooterContent> {
  return data;
}
