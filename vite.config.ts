import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto frontend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/static-assets': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // ✅ AGREGA ESTA CONFIGURACIÓN DE BUILD
  build: {
    outDir: '../turismo-backend/assets',
    assetsDir: '',  // ← Esto pone los archivos directamente en la raíz
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js'
      }
    }
  }
})