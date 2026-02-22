import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Fanart.tv n'autorise pas les requêtes directes depuis le navigateur (CORS).
      // En dev, on passe par le proxy pour éviter les erreurs réseau.
      "/fanart-api": {
        target: "https://webservice.fanart.tv",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/fanart-api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
