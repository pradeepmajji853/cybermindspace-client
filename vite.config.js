import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          ui: ['react-icons', 'react-hot-toast'],
          academy: [
            './src/data/academyData1.js',
            './src/data/academyData2.js',
            './src/data/academyData3.js',
            './src/data/academyData4.js',
            './src/data/academyData5.js',
            './src/data/academyData6.js',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
