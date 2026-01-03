import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Footer Sections',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Section Title', type: 'string' },
          { name: 'icon', title: 'Icon', type: 'string' },
          {
            name: 'links',
            title: 'Links',
            type: 'array',
            of: [{
              type: 'object',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
                { name: 'href', title: 'Link', type: 'string' },
              ],
            }],
          },
        ],
      }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Footer Content' };
    },
  },
});
