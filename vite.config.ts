import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    exclude: ['oboe']
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts']
  }
})