import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
  },
  // ✅ CONFIGURACIÓN CORREGIDA
  build: {
    outDir: '../turismo-backend/assets',
    assetsDir: 'assets',  // ← Cambiado de '' a 'assets'
  }
})