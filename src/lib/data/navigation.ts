import type { NavigationContent } from '@/data/content/navigation';
import { navigationContent as data } from '@/data/content/navigation-data.js';

export async function getNavigationContent(): Promise<NavigationContent> {
  return data;
}
