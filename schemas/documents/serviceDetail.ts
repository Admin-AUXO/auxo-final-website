import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'serviceDetail',
  title: 'Service Detail',
  type: 'document',
  fields: [
    defineField({ name: 'slug', title: 'Slug', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'shortDescription', title: 'Short Description', type: 'text' }),
    defineField({ name: 'icon', title: 'Icon', type: 'string' }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'subtitle', title: 'Subtitle', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        { name: 'keyBenefits', title: 'Key Benefits', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'overview',
      title: 'Overview Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        { name: 'challenges', title: 'Challenges', type: 'array', of: [{ type: 'string' }] },
        { name: 'solutions', title: 'Solutions', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'features',
          title: 'Features',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'icon', title: 'Icon', type: 'string' },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'process',
      title: 'Process Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'step', title: 'Step Number', type: 'string' },
              { name: 'title', title: 'Title', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
              { name: 'deliverables', title: 'Deliverables', type: 'array', of: [{ type: 'string' }] },
            ],
          }],
        },
      ],
    }),
    defineField({
      name: 'outcomes',
      title: 'Outcomes Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'descriptionHighlight', title: 'Description Highlight', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'metrics',
          title: 'Metrics',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'label', title: 'Label', type: 'string' },
              { name: 'value', title: 'Value', type: 'string' },
              { name: 'description', title: 'Description', type: 'text' },
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
    select: {
      title: 'name',
      subtitle: 'shortDescription',
    },
  },
});
