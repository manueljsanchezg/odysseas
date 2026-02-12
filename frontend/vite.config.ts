import tailwindcss from '@tailwindcss/vite'
import devtools from 'solid-devtools/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
})
