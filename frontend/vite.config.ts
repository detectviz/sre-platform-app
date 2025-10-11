import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.gen.js': 'js',
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
