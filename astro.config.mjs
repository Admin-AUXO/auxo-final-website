import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://auxodata.com',
  // Base path for GitHub Pages - use '/' for root or '/repo-name/' for subdirectory
  // If deploying to a subdirectory, set BASE_PATH environment variable in GitHub Actions
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
            // Split vendor chunks for better caching
            if (id.includes('node_modules')) {
              // Embla carousel in separate chunk
              if (id.includes('embla-carousel')) {
                return 'embla';
              }
              // Floating UI in separate chunk
              if (id.includes('@floating-ui')) {
                return 'floating-ui';
              }
              // Iconify in separate chunk
              if (id.includes('@iconify') || id.includes('astro-icon')) {
                return 'icons';
              }
              // Other vendor code
              return 'vendor';
            }
          },
          chunkFileNames: '_astro/[name]-[hash].js',
          entryFileNames: '_astro/[name]-[hash].js',
          assetFileNames: '_astro/[name]-[hash].[ext]',
        },
        onwarn(warning, warn) {
          // Suppress warnings from Astro's internal dependencies
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
        mdi: [
          // Navigation & UI
          'arrow-right',
          'chevron-down',
          'close',
          'check-circle',
          
          // Business & Industry
          'office-building',
          'bank',
          'store',
          'truck',
          'bed',
          'scale-balance',
          
          // Data & Analytics
          'chart-bar',
          'chart-box',
          'chart-line',
          'chart-pie',
          'database-search',
          'database-cog',
          'trending-up',
          
          // Security & Compliance
          'shield-check',
          'shield-lock',
          
          // Technology & AI
          'robot',
          'robot-industrial',
          'brain',
          'crystal-ball',
          
          // People & Teams
          'account-group',
          'account-group-outline',
          'account-tie',
          'handshake',
          
          // Content & Documents
          'book-open',
          'book-open-variant',
          'file-document-edit',
          'format-list-bulleted',
          
          // Design & Strategy
          'palette',
          'strategy',
          'target',
          'view-grid',
          'layers',
          
          // Location & Geography
          'map-marker-outline',
          'map-search',
          'earth',
          'web',
          
          // Social & Communication
          'linkedin',
          'twitter',
          'email-outline',
          
          // Theme & Display
          'moon-waning-crescent',
          'white-balance-sunny',
          'eye',
          'lightbulb',
          'lightbulb-on',
          
          // Actions & Tools
          'rocket-launch',
          'cog',
          'clock-outline',
        ],
      },
    }),
  ],
});

