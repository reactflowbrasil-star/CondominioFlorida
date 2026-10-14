import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.condominio-florida\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Condomínio Flórida',
        short_name: 'CondFlor',
        description: 'Sistema de Reservas do Condomínio Flórida',
        theme_color: '#1E3A8A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: { port: 5173, open: false },
  resolve: { alias: { '@': '/src' } },
});
