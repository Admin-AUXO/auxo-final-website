const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function sortByPublishDate<T extends { data: { publishDate: Date } }>(
  entries: T[],
): T[] {
  return [...entries].sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

export function formatBlogDate(date: Date): string {
  return BLOG_DATE_FORMATTER.format(date);
}

export function getBlogPostUrl(slug: string, trailingSlash = false): string {
  const path = `/blog/${slug}`;
  return trailingSlash ? `${path}/` : path;
}
