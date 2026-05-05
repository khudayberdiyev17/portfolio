import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-base-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/khudayberdiyev_admin') {
            res.statusCode = 302
            res.setHeader('Location', '/khudayberdiyev_admin/')
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
  // Base path must match nginx location alias
  base: '/khudayberdiyev_admin/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: true,
    port: 5174,
    proxy: {
      '/portfolio/v1/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
