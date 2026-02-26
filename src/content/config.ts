import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  type: "content", // v2.5.0+ and v3+ standard
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
};
