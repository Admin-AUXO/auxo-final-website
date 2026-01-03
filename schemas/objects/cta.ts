import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'cta',
  title: 'Call to Action',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'Button Link', type: 'string' }),
  ],
});
