import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    port: 80,
  },
  plugins: [
    VitePWA({
      selfDestroying: true,
    })
  ]
});
