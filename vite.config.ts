import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // WSL + /mnt/c (Windows filesystem) doesn't emit inotify events, so HMR
  // misses file changes. Polling makes the watcher pick them up reliably.
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
