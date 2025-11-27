import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://auxodata.com',
  // Base path; override with BASE_PATH for subdirectory deploys
  base: process.env.BASE_PATH || '/auxo-final-website/',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor chunks for caching
            if (id.includes('node_modules')) {
              if (id.includes('embla-carousel')) {
                return 'embla';
              }
              if (id.includes('@floating-ui')) {
                return 'floating-ui';
              }
              if (id.includes('@iconify') || id.includes('astro-icon')) {
                return 'icons';
              }
              return 'vendor';
            }
          },
          chunkFileNames: '_astro/[name]-[hash].js',
          entryFileNames: '_astro/[name]-[hash].js',
          assetFileNames: '_astro/[name]-[hash].[ext]',
        },
        onwarn(warning, warn) {
          // Ignore warnings from Astro internal helpers
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.id?.includes('@astrojs/internal-helpers')) {
            return;
          }
          warn(warning);
        },
      },
    },
    css: {
      devSourcemap: false,
    },
    esbuild: {
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true,
    },
    logLevel: 'warn',
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    icon({
      include: {
        // Keep this list in sync with mdi: usages across src
        mdi: [
          // Navigation
          'arrow-right',
          'chevron-down',
          'star-circle',
          'close',
          'alert-circle',
          'home',
          'briefcase',

          // Business
          'office-building',
          'bank',
          'store',
          'truck',
          'bed',
          'scale-balance',

          // Data
          'chart-bar',
          'chart-box',
          'chart-line',
          'chart-line-variant',
          'chart-areaspline',
          'chart-pie',
          'database-search',
          'database-cog',
          'database-plus',
          'trending-up',

          // Security
          'shield-check',
          'shield-lock',
          'shield-account',

          // Technology
          'robot',
          'robot-industrial',
          'brain',
          'crystal-ball',
          'cog-play',
          'ab-testing',
          'magnify-scan',
          'text-recognition',

          // People
          'account-group',
          'account-group-outline',
          'account-tie',
          'account-cog',
          'handshake',
          'school',

          // Content
          'book-open',
          'book-open-variant',
          'file-document',
          'file-document-edit',
          'file-document-multiple',
          'file-chart',
          'check-bold',
          'check-circle-outline',
          'check-circle',
          'format-list-bulleted',
          'clipboard-list',
          'checkbox-marked',

          // Design
          'palette',
          'strategy',
          'target',
          'view-grid',
          'layers',
          'tune',

          // Location
          'map-marker',
          'map-marker-outline',
          'map-marker-path',
          'map-search',
          'earth',
          'web',

          // Social
          'linkedin',
          'twitter',
          'email',
          'email-outline',
          'email-send',
          'send',

          // Display
          'eye',
          'lightbulb',
          'lightbulb-on',
          'moon-waning-crescent',
          'white-balance-sunny',

          // Actions
          'rocket-launch',
          'cog',
          'cog-sync',
          'monitor-dashboard',
          'monitor-eye',
          'cellphone-cog',
          'pipe',
          'quality-high',
          'clock-outline',
          'clock-check-outline',
          'calendar-outline',
          'calendar-check',

          // Legal
          'cookie',
          'information-outline',
        ],
      },
    }),
  ],
});

