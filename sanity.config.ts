import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'auxo-website',
  title: 'AUXO Data Labs',

  projectId: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  dataset: process.env.SANITY_DATASET || 'production',

  plugins: process.env.NODE_ENV === 'development' ? [
    structureTool(),
    visionTool(),
  ] : [],

  schema: {
    types: schemaTypes,
  },

  basePath: process.env.NODE_ENV === 'development' ? '/studio' : undefined,
});
