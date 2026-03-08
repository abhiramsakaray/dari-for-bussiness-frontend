import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/merchant': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/payment': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/billing': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/onboarding': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/subscriptions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/invoices': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/payment-links': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/refunds': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/team': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
