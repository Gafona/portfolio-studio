import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { studioDevPlugin } from './vite-plugin-studio';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react(), tailwindcss(), studioDevPlugin()],
  server: {
    watch: {
      ignored: ['**/public/uploads/**', '**/public/themes/**'],
    },
  },
}));
