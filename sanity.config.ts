import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'auxo-website',
  title: 'AUXO Data Labs',

  projectId: import.meta.env.SANITY_PROJECT_ID || '4ddas0r0',
  dataset: import.meta.env.SANITY_DATASET || 'production',

  plugins: import.meta.env.DEV ? [
    structureTool(),
    visionTool(),
  ] : [],

  schema: {
    types: schemaTypes,
  },

  basePath: import.meta.env.DEV ? '/studio' : undefined,
});
