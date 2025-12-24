import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';
import AstroPWA from '@vite-pwa/astro';
import sitemap from '@astrojs/sitemap';
import astroEdge from 'astro-edge';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://auxodata.com',
  base: basePath,
  output: 'static',
  build: {
    inlineStylesheets: 'never',
    assets: '_astro',
    minify: 'terser',
    sourcemap: false,
  },
  compressHTML: true,
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [],
  },
  vite: {
    optimizeDeps: {
      include: [
        '@heroui/react',
        'framer-motion',
        'embla-carousel',
        '@floating-ui/dom',
        'lenis',
        'aos',
        'sharp',
        'react',
        'react-dom'
      ],
      exclude: ['@heroui/theme'],
    },
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          chunkFileNames: '_astro/[name]-[hash].js',
          entryFileNames: '_astro/[name]-[hash].js',
          assetFileNames: '_astro/[name]-[hash].[ext]',
          manualChunks(id) {
            // Split large libraries into separate chunks
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@heroui/react') || id.includes('embla-carousel') || id.includes('@floating-ui/dom')) return 'ui-vendor';
            if (id.includes('aos') || id.includes('lenis')) return 'animation-vendor';
            if (id.includes('astro-icon')) return 'icons';
          },
        },
        onwarn(warning, warn) {
          // Suppress common warnings
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.id?.includes('@astrojs/internal-helpers')) {
            return;
          }
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('node_modules')) {
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
      treeShaking: true,
    },
    logLevel: 'warn',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    ssr: {
      noExternal: ['@heroui/react'],
    },
  },
  integrations: [
    astroEdge({
      optimization: {
        images: {
          format: 'webp',
          quality: 80,
          progressive: true,
          effort: 6
        },
        static: true,
        compression: true,
        fonts: {
          preload: true,
          display: 'swap'
        },
        scripts: {
          async: true,
          defer: true
        },
        styles: {
          critical: true,
          minify: true
        }
      },
      monitoring: {
        lighthouse: true,
        webVitals: true,
        bundleAnalyzer: true,
        systemHealth: true,
        thresholds: {
          performance: 95,
          accessibility: 90,
          'best-practices': 90,
          seo: 90,
          fcp: 1800, // First Contentful Paint
          lcp: 2500, // Largest Contentful Paint
          cls: 0.1,  // Cumulative Layout Shift
          fid: 100,  // First Input Delay
          ttfb: 800  // Time to First Byte
        },
        budgets: [
          {
            type: 'bundle',
            name: 'main',
            maximumWarning: '150 KB',
            maximumError: '200 KB'
          },
          {
            type: 'bundle',
            name: 'vendor',
            maximumWarning: '300 KB',
            maximumError: '400 KB'
          }
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
      base: basePath,
      scope: basePath,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sanity-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AUXO Data Labs',
        short_name: 'AUXO',
        description: 'AUXO is a Dubai-based data analytics consultancy serving sophisticated clients across the GCC, Europe, and global markets.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: `${basePath}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: `${basePath}apple-touch-icon.svg`,
            sizes: '180x180',
            type: 'image/svg+xml',
          },
          {
            src: `${basePath}logo.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: 'module',
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

