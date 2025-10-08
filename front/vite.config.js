import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false, // No abrir el navegador automáticamente
    proxy: {
      '/api': 'http://localhost:8000', // Redirige todas las solicitudes /api al backend
    },
  },
  // Añadido para solucionar los errores de resolución de @tauri-apps/api
  optimizeDeps: {
    exclude: ['@tauri-apps/plugin-http']
  },
  build: {
    rollupOptions: {
      external: ['@tauri-apps/plugin-http']
    }
  }
})