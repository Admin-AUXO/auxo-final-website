import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'headline', title: 'Headline', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'ctaText', title: 'CTA Text', type: 'string' },
        { name: 'ctaHref', title: 'CTA Link', type: 'string' },
      ],
    }),
    defineField({
      name: 'mission',
      title: 'Mission Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'mission', title: 'Mission', type: 'text' },
        { name: 'missionHighlight', title: 'Mission Highlight', type: 'array', of: [{ type: 'string' }] },
        { name: 'vision', title: 'Vision', type: 'text' },
        { name: 'visionHighlight', title: 'Vision Highlight', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'purpose',
      title: 'Purpose Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'nameOrigin',
          title: 'Name Origin',
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
            { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
          ],
        },
      ],
    }),
    defineField({
      name: 'approach',
      title: 'Approach Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'principles',
          title: 'Principles',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'letter', title: 'Letter', type: 'string' },
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'team',
      title: 'Team Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        {
          name: 'leadership',
          title: 'Leadership',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'role', title: 'Role', type: 'string' },
              { name: 'bio', title: 'Bio', type: 'text' },
            ],
          }],
        },
        {
          name: 'advisors',
          title: 'Advisors',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'role', title: 'Role', type: 'string' },
              { name: 'bio', title: 'Bio', type: 'text' },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'partnership',
      title: 'Partnership Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'global',
      title: 'Global Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'cta',
      title: 'CTA Section',
      type: 'cta',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page Content' };
    },
  },
});
