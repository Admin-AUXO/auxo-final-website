import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://auxodata.com',
  base: process.env.BASE_PATH || '/auxo-final-website/',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [],
  },
  vite: {
    optimizeDeps: {
      include: ['@heroui/react', 'framer-motion', 'embla-carousel', '@floating-ui/dom', 'lenis'],
      exclude: ['@heroui/theme'],
      force: false, // Set to true if you need to force re-optimization
    },
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('embla-carousel')) return 'embla';
              if (id.includes('@floating-ui')) return 'floating-ui';
              if (id.includes('@iconify') || id.includes('astro-icon')) return 'icons';
              if (id.includes('@heroui')) return 'heroui';
              if (id.includes('framer-motion')) return 'framer-motion';
              return 'vendor';
            }
          },
          chunkFileNames: '_astro/[name]-[hash].js',
          entryFileNames: '_astro/[name]-[hash].js',
          assetFileNames: '_astro/[name]-[hash].[ext]',
        },
        onwarn(warning, warn) {
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
    ssr: {
      noExternal: ['@heroui/react'],
    },
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    icon({
      include: {
        'simple-icons': [
          // Cloud Platforms
          'amazonaws',
          'microsoftazure',
          'googlecloud',
          'snowflake',
          'databricks',
          // Data & Analytics Tools
          'tableau',
          'powerbi',
          'apacheairflow',
          'apachekafka',
          'apachespark',
          'dbt',
          'looker',
          'metabase',
          'apachesuperset',
          // ML & AI
          'tensorflow',
          'pytorch',
          'huggingface',
          'scikitlearn',
          'mlflow',
          // Databases
          'postgresql',
          'mongodb',
          'redis',
          'elasticsearch',
          // Development Tools
          'python',
          'git',
          'docker',
          'kubernetes',
          'jupyter',
          'pandas',
          'numpy',
          'r',
          'grafana',
          'prometheus',
          'influxdb',
          'cockroachlabs',
          'apachecassandra',
          'flask',
        ],
        mdi: [
          // Navigation
          'arrow-right',
          'chevron-down',
          'chevron-right',
          'star-circle',
          'close',
          'alert-circle',
          'home',
          'briefcase',
          'view-grid',

          // Business & Industries
          'domain',
          'palm-tree',
          'shopping',
          'cart',
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
          'database',
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
          'flash',
          'notebook',
          'source-branch',
          'docker',
          'kubernetes',
          'cloud',
          'cloud-upload',
          'workflow',
          'ray-start-end',
          'link-variant',
          'vector-triangle',
          'chart-box-outline',
          'water',
          'compare-horizontal',
          'pipe',
          'cube',
          'database-clock',
          'hexagon',
          'api',
          'cog',
          'rabbit',

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

