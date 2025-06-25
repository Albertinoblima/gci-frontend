// gci-frontend/vite.config.js
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
// Configuração para compatibilidade com process.env
define: {
  'process.env': process.env,
  global: 'globalThis',
},
  plugins: [react()],
  resolve: {
    alias: {
      // Aqui está a configuração do alias.
      // Ele diz ao Vite que sempre que encontrar um caminho
      // que começa com '@/', ele deve substituí-lo pelo
      // caminho absoluto para a pasta 'src'.
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
})