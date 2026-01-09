import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');

export default defineConfig({
  site: 'https://auxodata.com',
  base: '/',
  output: 'static',
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    remotePatterns: [{ protocol: 'https' }],
  },
  vite: {
    optimizeDeps: {
      include: ['embla-carousel', 'sharp', '@sanity/client', 'astro-icon'],
    },
    define: {
      'import.meta.env.SANITY_PROJECT_ID': JSON.stringify(env.SANITY_PROJECT_ID || '4ddas0r0'),
      'import.meta.env.SANITY_DATASET': JSON.stringify(env.SANITY_DATASET || 'production'),
      'import.meta.env.SANITY_API_TOKEN': JSON.stringify(env.SANITY_API_TOKEN || ''),
      'import.meta.env.SANITY_API_VERSION': JSON.stringify(env.SANITY_API_VERSION || '2024-01-01'),
    },
    build: {
      sourcemap: false,
      target: 'esnext',
      cssCodeSplit: true,
      minify: 'terser',
      chunkSizeWarningLimit: 500,
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
          experimentalMinChunkSize: 1500,
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('embla-carousel')) return 'ui-vendor';
              if (id.includes('astro-icon') || id.includes('@iconify')) return 'icons';
              if (id.includes('@sanity/') || id.includes('groq')) return 'sanity';
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('@emailjs')) return 'emailjs';
              if (id.includes('lenis')) return 'lenis';
            }
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.id?.includes('@astrojs/internal-helpers')) return;
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('node_modules')) return;
          if (warning.code === 'ROLLUP_WARNING' && warning.message?.includes('chunk size')) return;
          if (warning.code === 'EMPTY_BUNDLE') return;
          if (warning.message?.includes('Generated an empty chunk')) return;
          if (warning.message?.includes('isRemoteAllowed') || warning.message?.includes('matchHostname') || warning.message?.includes('matchPathname') || warning.message?.includes('matchPort') || warning.message?.includes('matchProtocol')) return;
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
      projectId: process.env.SANITY_PROJECT_ID || env.SANITY_PROJECT_ID || '4ddas0r0',
      dataset: process.env.SANITY_DATASET || env.SANITY_DATASET || 'production',
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
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
        },
      },
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
  ],
});

