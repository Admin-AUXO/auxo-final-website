import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'services',
  title: 'Services Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'headline', title: 'Headline', type: 'string' },
        { name: 'headlineLine1', title: 'Headline Line 1', type: 'string' },
        { name: 'headlineLine2', title: 'Headline Line 2', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        { name: 'ctaText', title: 'CTA Text', type: 'string' },
        { name: 'ctaHref', title: 'CTA Link', type: 'string' },
      ],
    }),
    defineField({
      name: 'stages',
      title: 'Stages Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'services',
          title: 'Services',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'link', title: 'Link', type: 'string' },
            ],
          }],
        },
        { name: 'codeEdge', title: 'Code Edge', type: 'text' },
        { name: 'codeEdgeHighlight', title: 'Code Edge Highlight', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'impact',
      title: 'Impact Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'industries',
          title: 'Industries',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'icon', title: 'Icon', type: 'string' },
              { name: 'useCases', title: 'Use Cases', type: 'array', of: [{ type: 'string' }] },
              { name: 'keyBenefit', title: 'Key Benefit', type: 'string' },
              { name: 'keyBenefitHighlight', title: 'Key Benefit Highlight', type: 'array', of: [{ type: 'string' }] },
            ],
          }],
        },
        { name: 'goal', title: 'Goal', type: 'text' },
        { name: 'goalHighlight', title: 'Goal Highlight', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'models',
      title: 'Models Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'models',
          title: 'Models',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'subheadline', title: 'Subheadline', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'bestFor', title: 'Best For', type: 'text' },
              { name: 'bestForHighlight', title: 'Best For Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'deliverables', title: 'Deliverables', type: 'array', of: [{ type: 'string' }] },
              { name: 'idealFor', title: 'Ideal For', type: 'array', of: [{ type: 'string' }] },
            ],
          }],
        },
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
      return { title: 'Services Page Content' };
    },
  },
});
