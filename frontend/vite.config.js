import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: 'hidden', // Genera source maps pero no los enlaza públicamente
  },
  server: {
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      // Solo ignora los source maps problemáticos específicos
      return sourcePath.includes('node_modules') ||
             sourcePath.includes('react_devtools_backend') ||
             sourcePath.includes('installHook.js') ||
             sourcePath.includes('%3Canonymous%20code%3E')
    }
  }
})