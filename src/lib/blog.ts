const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const WORDS_PER_MINUTE = 220;

export interface BlogHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

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

export function getReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export function getBlogPostUrl(slug: string, trailingSlash = false): string {
  const path = `/blog/${slug}`;
  return trailingSlash ? `${path}/` : path;
}

function normalizeHeadingText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

function createHeadingId(value: string): string {
  return (
    normalizeHeadingText(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

export function extractBlogHeadings(markdown: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  const seenIds = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  let insideCodeFence = false;

  for (const line of lines) {
    if (/^(```|~~~)/.test(line.trim())) {
      insideCodeFence = !insideCodeFence;
      continue;
    }

    if (insideCodeFence) {
      continue;
    }

    const match = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!match) {
      continue;
    }

    const text = normalizeHeadingText(match[2]);
    const baseId = createHeadingId(text);
    const duplicateCount = seenIds.get(baseId) ?? 0;
    seenIds.set(baseId, duplicateCount + 1);

    headings.push({
      id: duplicateCount > 0 ? `${baseId}-${duplicateCount}` : baseId,
      level: match[1].length as 2 | 3,
      text,
    });
  }

  return headings;
}
