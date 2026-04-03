import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteData } from "@/data/content";
import { getBlogPostUrl, sortByPublishDate } from "@/lib/blog";

export async function GET(context: import('astro').APIContext) {
  const blog = sortByPublishDate(await getCollection('blog'));
  
  return rss({
    title: `${siteData.name} | Insights`,
    description: siteData.description,
    site: context.site || siteData.url,
    items: blog.map((post: (typeof blog)[number]) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: getBlogPostUrl(post.slug, true),
    })),
    customData: `<language>en-us</language>`,
  });
}
