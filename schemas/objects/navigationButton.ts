import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'navigationButton',
  title: 'Navigation Button',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Button Text', type: 'string' }),
    defineField({ name: 'href', title: 'Button Link', type: 'string' }),
  ],
});
