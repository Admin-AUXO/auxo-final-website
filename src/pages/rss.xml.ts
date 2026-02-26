import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSiteConfigData } from '@/lib/data/siteConfig-compat';

export async function GET(context: any) {
  const blog = await getCollection('blog');
  const siteData = await getSiteConfigData();
  
  return rss({
    title: `${siteData.name} | Insights`,
    description: siteData.description,
    site: context.site || siteData.url,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
