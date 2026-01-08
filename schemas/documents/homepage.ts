import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'hero',
    }),
    defineField({
      name: 'valueProposition',
      title: 'Value Proposition Section',
      type: 'object',
      description: 'The second section showcasing the problem and solution',
      fields: [
        {
          name: 'line1',
          title: 'Line 1 (Small)',
          type: 'text',
          description: 'First line - displayed smaller, sets up the problem',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'line2',
          title: 'Line 2 (Big with Effects)',
          type: 'text',
          description: 'Second line - displayed larger with gradient effects, presents the solution',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'featuredServices',
      title: 'Featured Services',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'subheading', title: 'Subheading', type: 'text' },
        {
          name: 'items',
          title: 'Service Items',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'number', title: 'Number', type: 'string' },
              { name: 'icon', title: 'Icon', type: 'string' },
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'link', title: 'Link', type: 'string' },
            ],
          }],
        },
        {
          name: 'navigationButton',
          title: 'Navigation Button',
          type: 'navigationButton',
        },
      ],
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'subtitle', title: 'Subtitle', type: 'text' },
        {
          name: 'items',
          title: 'Technologies',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string' },
              { name: 'icon', title: 'Icon', type: 'string' },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'capabilities',
      title: 'Capabilities Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'subheading', title: 'Subheading', type: 'text' },
        {
          name: 'cards',
          title: 'Capability Cards',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'icon', title: 'Icon', type: 'string' },
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'metric', title: 'Metric', type: 'string' },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'titleHighlight', title: 'Title Highlight', type: 'string' },
        { name: 'subtitle', title: 'Subtitle', type: 'string' },
        {
          name: 'steps',
          title: 'Process Steps',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'number', title: 'Step Number', type: 'number' },
              { name: 'icon', title: 'Icon', type: 'string' },
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
              { name: 'output', title: 'Output', type: 'string' },
            ],
          }],
        },
        {
          name: 'navigationButton',
          title: 'Navigation Button',
          type: 'navigationButton',
        },
      ],
    }),
    defineField({
      name: 'finalCta',
      title: 'Final CTA Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'subtitle', title: 'Subtitle', type: 'string' },
        { name: 'ctaText', title: 'CTA Button Text', type: 'string' },
        { name: 'ctaHref', title: 'CTA Button Link', type: 'string' },
        { name: 'body', title: 'Body Text', type: 'text' },
        { name: 'bodyHighlight', title: 'Body Highlight', type: 'array', of: [{ type: 'string' }] },
        { name: 'reassuranceLine', title: 'Reassurance Line', type: 'string' },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage Content' };
    },
  },
});
