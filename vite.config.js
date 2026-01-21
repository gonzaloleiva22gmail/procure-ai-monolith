import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/chat': 'http://localhost:8000',
      '/template-chat': 'http://localhost:8000',
      '/templates': 'http://localhost:8000',
      '/contracts': 'http://localhost:8000',
      '/analyze': 'http://localhost:8000',
      '/generate': 'http://localhost:8000',
      '/draft': 'http://localhost:8000',
    }
  }
})
