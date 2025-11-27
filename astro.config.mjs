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
        // Optimized to include only actively used icons (89 icons)
        mdi: [
          // Navigation
          'arrow-right',
          'chevron-down',
          'star-circle',
          'close',
          'alert-circle',
          'home',
          'briefcase',

          // Business & Industries
          'domain',
          'palm-tree',
          'shopping',
          'finance',
          'package-variant',
          'gavel',

          // Data & Analytics
          'chart-box',
          'chart-line',
          'chart-line-variant',
          'chart-areaspline',
          'chart-timeline-variant',
          'chart-donut-variant',
          'database-search',
          'database-cog',
          'database-plus',
          'trending-up',
          'view-dashboard-variant',
          'server-network',

          // Security & Quality
          'shield-check',
          'shield-check-outline',
          'shield-lock',
          'shield-account',
          'shield-star',

          // Technology & Science
          'robot',
          'brain',
          'crystal-ball',
          'cog-play',
          'ab-testing',
          'magnify-scan',
          'text-recognition',
          'atom',
          'compass-outline',
          'function-variant',
          'head-lightbulb',
          'auto-fix',

          // People & Tools
          'account-group',
          'account-group-outline',
          'account-tie',
          'handshake',
          'school',
          'toolbox',

          // Content & Documents
          'book-open',
          'book-open-variant',
          'file-document',
          'file-document-multiple',
          'file-chart',
          'file-tree',
          'check-bold',
          'check-circle-outline',
          'check-circle',
          'check-decagram',
          'format-list-bulleted',
          'clipboard-list',
          'clipboard-text-outline',
          'checkbox-marked',

          // Design & Planning
          'palette',
          'target',
          'bullseye',
          'crosshairs-gps',
          'layers',
          'tune',
          'flag-checkered',
          'hammer-wrench',

          // Location
          'map-marker',
          'map-marker-outline',
          'map-marker-path',
          'map-search',
          'earth',
          'web',

          // Social & Communication
          'linkedin',
          'twitter',
          'email-outline',
          'send',
          'file-send',

          // Display & Vision
          'telescope',
          'lightbulb',
          'lightbulb-on',
          'moon-waning-crescent',
          'white-balance-sunny',

          // Actions & Operations
          'rocket-launch',
          'cog',
          'cogs',
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
          'waves',

          // Legal
          'cookie',
          'information-outline',
        ],
      },
    }),
  ],
});

