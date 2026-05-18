import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'chrome49', // للتوافق مع متصفحات التلفاز القديمة
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})