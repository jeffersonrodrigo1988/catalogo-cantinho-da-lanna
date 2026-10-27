import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['@tauri-apps/api/core', '@tauri-apps/api', '@tauri-apps/plugin-opener', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-fs'],
    },
  },
  optimizeDeps: {
    exclude: ['@tauri-apps/api/core', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-fs'],
  },
});