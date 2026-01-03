import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Site Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    defineField({ name: 'email', title: 'Email', type: 'email' }),
    defineField({ name: 'privacyEmail', title: 'Privacy Email', type: 'email' }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        { name: 'street', title: 'Street', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'country', title: 'Country', type: 'string' },
        { name: 'lat', title: 'Latitude', type: 'number' },
        { name: 'lng', title: 'Longitude', type: 'number' },
      ],
    }),
    defineField({
      name: 'social',
      title: 'Social Media',
      type: 'object',
      fields: [
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'twitter', title: 'Twitter', type: 'url' },
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'object',
      fields: [
        { name: 'yearsExperience', title: 'Years Experience', type: 'string' },
        { name: 'technologiesMastered', title: 'Technologies Mastered', type: 'string' },
        { name: 'industriesServed', title: 'Industries Served', type: 'string' },
        { name: 'foundingClients', title: 'Founding Clients', type: 'string' },
        { name: 'responseTime', title: 'Response Time', type: 'string' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline',
    },
  },
});
