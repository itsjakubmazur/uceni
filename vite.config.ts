import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Aplikace musí fungovat úplně offline, včetně všech promluv.
 *
 * Audio je zdaleka největší část (přes 380 souborů, kolem 7 MB), takže se
 * záměrně předukládá celé. Alternativa — dotahovat klipy za běhu — by
 * znamenala, že na chatě bez signálu appka oněmí, a to je horší než jedno
 * delší první stažení.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Ne autoUpdate: nová verze by se aktivovala a stránku načetla znovu
      // klidně uprostřed úlohy. Registraci si řídí aplikace sama a novou
      // verzi nasadí, až bude Mikuláš na rozcestníku.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['fonts/*.woff2', 'audio/**/*', 'icons/*'],
      manifest: {
        name: 'Mikuláš se učí',
        short_name: 'Mikuláš',
        description: 'Čísla a písmena hlasem, obrázky a dotykem.',
        lang: 'cs',
        start_url: '/',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#3B2A20',
        theme_color: '#8E2C21',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,m4a,mp3,json}'],
        // Výchozí strop je 2 MiB a sadu audia by uřízl.
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { host: true },
});
