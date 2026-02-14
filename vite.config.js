import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/leonardo': {
        target: 'https://cloud.leonardo.ai/api/rest/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/leonardo/, '')
      },
      '/api/s3-upload': {
        target: 'https://image-flex-213441772509-prod-images.s3-accelerate.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/s3-upload/, '')
      }
    }
  }
})
