import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import { vitePwa } from '@vite-pwa/astro';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = loadEnv('development', process.cwd(), '');

export default defineConfig({
  site: 'https://auxodata.com',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  compressHTML: true,
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  experimental: {
    inlineStylesheets: 'auto',
    viewTransitions: true,
  },
  vite: {
    optimizeDeps: {
      include: ['embla-carousel', '@floating-ui/dom', 'sharp', '@sanity/client', 'groq', 'astro-icon'],
    },
    define: {
      'import.meta.env.SANITY_PROJECT_ID': JSON.stringify(env.SANITY_PROJECT_ID),
      'import.meta.env.SANITY_DATASET': JSON.stringify(env.SANITY_DATASET),
      'import.meta.env.SANITY_API_TOKEN': JSON.stringify(env.SANITY_API_TOKEN),
      'import.meta.env.SANITY_API_VERSION': JSON.stringify(env.SANITY_API_VERSION),
    },
    build: {
      sourcemap: false,
      target: 'esnext',
      cssCodeSplit: true,
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: { safari10: true },
      },
      rollupOptions: {
        maxParallelFileOps: 3,
        output: {
          chunkFileNames: '_astro/[name]-[hash].js',
          entryFileNames: '_astro/[name]-[hash].js',
          assetFileNames: '_astro/[name]-[hash].[ext]',
          experimentalMinChunkSize: 1000,
          manualChunks(id) {
            if (id.includes('embla-carousel') || id.includes('@floating-ui/dom') || id.includes('@use-gesture')) return 'ui-vendor';
            if (id.includes('astro-icon') || id.includes('@iconify')) return 'icons';
            if (id.includes('@sanity/') || id.includes('groq')) return 'sanity';
            if (id.includes('@astrojs/react') || id.includes('react')) return 'react-vendor';
            if (id.includes('notyf') || id.includes('focus-trap') || id.includes('zod')) return 'utils';
            if (id.includes('node:') || id.includes('buffer') || id.includes('process')) return 'polyfills';
            if (id.includes('tailwindcss') || id.includes('autoprefixer')) return 'build-tools';
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.id?.includes('@astrojs/internal-helpers')) return;
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('node_modules')) return;
          if (warning.code === 'ROLLUP_WARNING' && warning.message?.includes('chunk size')) return;
          warn(warning);
        },
      },
    },
    css: { devSourcemap: false },
    esbuild: {
      legalComments: 'none',
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    logLevel: 'warn',
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  },
  integrations: [
    ...(process.env.NODE_ENV === 'development' ? [sanity({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      useCdn: false,
      studioBasePath: '/studio',
    })] : []),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
    icon({
      include: {
        'simple-icons': [
          'amazonaws',
          'microsoftazure',
          'googlecloud',
          'snowflake',
          'databricks',
          'tableau',
          'powerbi',
          'apacheairflow',
          'apachekafka',
          'apachespark',
          'dbt',
          'looker',
          'metabase',
          'apachesuperset',
          'tensorflow',
          'pytorch',
          'huggingface',
          'scikitlearn',
          'mlflow',
          'postgresql',
          'mongodb',
          'redis',
          'elasticsearch',
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
          'arrow-right','calendar-clock','calendar-plus','video-outline',
          'chevron-down',
          'chevron-right',
          'star-circle',
          'close',
          'alert-circle',
          'home',
          'briefcase',
          'view-grid',
          'domain',
          'palm-tree',
          'shopping',
          'cart',
          'finance',
          'package-variant',
          'gavel',
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
          'shield-check',
          'shield-check-outline',
          'shield-lock',
          'shield-account',
          'shield-star',
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
          'cloud',
          'cloud-upload',
          'workflow',
          'ray-start-end',
          'link-variant',
          'vector-triangle',
          'chart-box-outline',
          'water',
          'compare-horizontal',
          'cube',
          'database-clock',
          'hexagon',
          'api',
          'rabbit',
          'account-group',
          'account-group-outline',
          'account-tie',
          'handshake',
          'school',
          'toolbox',
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
          'palette',
          'target',
          'bullseye',
          'crosshairs-gps',
          'layers',
          'tune',
          'flag-checkered',
          'hammer-wrench',
          'map-marker',
          'map-marker-outline',
          'map-marker-path',
          'map-search',
          'earth',
          'web',
          'linkedin',
          'twitter',
          'email-outline',
          'send',
          'file-send',
          'telescope',
          'lightbulb',
          'lightbulb-on',
          'moon-waning-crescent',
          'white-balance-sunny',
          'rocket-launch',
          'cogs',
          'cog-sync',
          'monitor-dashboard',
          'monitor-eye',
          'cellphone-cog',
          'quality-high',
          'clock-outline',
          'clock-check-outline',
          'calendar-outline',
          'calendar-check',
          'waves',
          'cookie',
          'information-outline',
          'pipe',
        ],
      },
    }),
    vitePwa({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,js,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sanity-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AUXO - Data Analytics Consultancy',
        short_name: 'AUXO',
        description: 'Expert data analytics consultancy helping businesses scale with data-driven insights and AI solutions.',
        theme_color: '#1a365d',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/apple-touch-icon.svg',
            sizes: '180x180',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
});

