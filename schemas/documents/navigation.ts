import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Navigation Items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Name', type: 'string' },
          { name: 'href', title: 'Link', type: 'string' },
          { name: 'isModal', title: 'Is Modal', type: 'boolean' },
          {
            name: 'dropdown',
            title: 'Dropdown Items',
            type: 'array',
            of: [{
              type: 'object',
              fields: [
                { name: 'name', title: 'Name', type: 'string' },
                { name: 'href', title: 'Link', type: 'string' },
                { name: 'icon', title: 'Icon', type: 'string' },
                { name: 'description', title: 'Description', type: 'text' },
              ],
            }],
          },
        ],
      }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Navigation Content' };
    },
  },
});
