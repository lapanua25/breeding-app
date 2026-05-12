import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Botanical Breed',
        short_name: 'Botanical',
        description: '植物交配記録アプリ',
        theme_color: '#059669',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/breeding-app/',
        scope: '/breeding-app/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/blnbyntjpddiyujuewsc\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  base: '/breeding-app/',
})
