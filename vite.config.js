import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        analyze: resolve(__dirname, 'analyze/index.html'),
        compare: resolve(__dirname, 'compare/index.html'),
        metrics: resolve(__dirname, 'metrics/index.html'),
        methodology: resolve(__dirname, 'methodology/index.html')
      }
    }
  }
});
