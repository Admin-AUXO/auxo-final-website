import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://auxodata.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    icon(),
  ],
});

