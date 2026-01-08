import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

const getEnv = (key: string, fallback: string | boolean) => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  if (process.env[`SANITY_${key}`]) {
    return process.env[`SANITY_${key}`];
  }
  return fallback;
};

export default defineConfig({
  name: 'auxo-website',
  title: 'AUXO Data Labs',

  projectId: (getEnv('SANITY_PROJECT_ID', '4ddas0r0') as string),
  dataset: (getEnv('SANITY_DATASET', 'production') as string),

  plugins: getEnv('DEV', false) ? [
    structureTool(),
    visionTool(),
  ] : [],

  schema: {
    types: schemaTypes,
  },

  basePath: getEnv('DEV', false) ? '/studio' : undefined,
});
