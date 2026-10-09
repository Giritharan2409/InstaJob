import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(currentDir, './node_modules/react'),
      'react-dom': path.resolve(currentDir, './node_modules/react-dom'),
    }
  }
})
