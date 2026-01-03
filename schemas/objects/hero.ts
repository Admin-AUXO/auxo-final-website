import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'hero',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'titleHighlight', title: 'Title Highlight', type: 'string' }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'text' }),
    defineField({ name: 'subtitleHighlight', title: 'Subtitle Highlight', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'object',
      fields: [
        { name: 'text', title: 'Button Text', type: 'string' },
        { name: 'href', title: 'Button Link', type: 'string' },
      ],
    }),
    defineField({ name: 'scrollIndicator', title: 'Scroll Indicator Text', type: 'string' }),
  ],
});
