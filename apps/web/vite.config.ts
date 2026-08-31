import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  plugins: [cloudflare()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
