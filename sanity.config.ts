import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';

export default defineConfig({
  name: 'auxo-website',
  title: 'AUXO Data Labs',

  projectId: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  dataset: process.env.SANITY_DATASET || 'production',

  plugins: [
    deskTool(),
    visionTool(),
  ],

  studio: {
    basePath: '/studio',
  },
});
