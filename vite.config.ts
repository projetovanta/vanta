import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    logLevel: 'error',
    server: {
      port: 5173,
      host: true,
      warmup: { clientFiles: [] },
      watch: { usePolling: false },
      proxy: {
        '/api/supabase-mgmt': {
          target: 'https://api.supabase.com',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/supabase-mgmt/, ''),
        },
      },
    },
    optimizeDeps: {
      holdUntilCrawlEnd: true,
    },
    plugins: [
      tailwindcss(),
      react(),
      ...(process.env.ANALYZE === 'true' ? [visualizer({ open: true, gzipSize: true, brotliSize: true })] : []),
      ...(process.env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
            }),
          ]
        : []),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',

        // SW auto-gerado pelo Workbox (generateSW — padrão)
        strategies: 'generateSW',

        // Não gera manifest próprio — usa o /public/manifest.json existente
        manifest: false,

        // Arquivos a pré-cachear
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          skipWaiting: true,
          clientsClaim: true,

          // Runtime caching — reduz requests repetidas
          runtimeCaching: [
            {
              // Supabase REST API — stale-while-revalidate
              urlPattern: /\/rest\/v1\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'supabase-api',
                expiration: { maxEntries: 200, maxAgeSeconds: 300 }, // 5min
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Imagens Supabase Storage
              urlPattern: /\/storage\/v1\/object\/public\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-images',
                expiration: { maxEntries: 500, maxAgeSeconds: 86400 }, // 24h
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Imagens imgur
              urlPattern: /^https:\/\/i\.imgur\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'imgur-images',
                expiration: { maxEntries: 300, maxAgeSeconds: 604800 }, // 7d
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },

        devOptions: {
          enabled: false, // SW só ativo em produção
        },
      }),
    ],
    build: {
      sourcemap: 'hidden',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-sentry': ['@sentry/react'],
            'vendor-qr': ['qrcode.react'],
          },
        },
      },
    },
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
