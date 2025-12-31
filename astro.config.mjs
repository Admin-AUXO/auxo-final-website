import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import node from '@astrojs/node';
import icon from 'astro-icon';
import AstroPWA from '@vite-pwa/astro';
import sitemap from '@astrojs/sitemap';
import astroEdge from 'astro-edge';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.BASE_PATH || '/';
const base = basePath === '/' ? undefined : basePath;

export default defineConfig({
  site: 'https://auxodata.com',
  base,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  build: {
    inlineStylesheets: 'never',
    assets: '_astro',
    minify: 'terser',
    sourcemap: false,
  },
  compressHTML: true,
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    remotePatterns: [],
  },
  vite: {
    optimizeDeps: {
      include: ['embla-carousel', '@floating-ui/dom', 'sharp', '@sanity/client', 'groq', 'astro-icon'],
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
            if (id.includes('@vite-pwa') || id.includes('astro-edge')) return 'pwa';
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
    ssr: { noExternal: [] },
  },
  integrations: [
    sanity({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      useCdn: false,
      studioBasePath: '/studio',
    }),
    astroEdge({
      optimization: {
        images: { format: 'webp', quality: 80, progressive: true, effort: 6 },
        static: true,
        compression: true,
        fonts: { preload: true, display: 'swap' },
        scripts: { async: true, defer: true },
        styles: { critical: true, minify: true }
      },
      monitoring: {
        lighthouse: true,
        webVitals: true,
        bundleAnalyzer: true,
        systemHealth: true,
        thresholds: { performance: 95, accessibility: 90, 'best-practices': 90, seo: 90, fcp: 1800, lcp: 2500, cls: 0.1, fid: 100, ttfb: 800 },
        budgets: [
          { type: 'bundle', name: 'main', maximumWarning: '150 KB', maximumError: '200 KB' },
          { type: 'bundle', name: 'vendor', maximumWarning: '300 KB', maximumError: '400 KB' }
        ]
      },
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
    AstroPWA({
      registerType: 'autoUpdate',
      base: base || '/',
      scope: base || '/',
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'sanity-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } } },
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } }
        ],
      },
      manifest: {
        name: 'AUXO Data Labs',
        short_name: 'AUXO',
        description: 'AUXO is a Dubai-based data analytics consultancy serving sophisticated clients across the GCC, Europe, and global markets.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        start_url: base || '/',
        scope: base || '/',
        icons: [
          { src: `${base || '/'}favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: `${base || '/'}apple-touch-icon.svg`, sizes: '180x180', type: 'image/svg+xml' },
          { src: `${base || '/'}logo.svg`, sizes: '512x512', type: 'image/svg+xml' }
        ],
      },
      devOptions: { enabled: false, type: 'module' },
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

