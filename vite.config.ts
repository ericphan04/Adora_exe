import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // sockjs-client expects Node's `global` (used by STOMP WebSocket)
  define: {
    global: 'globalThis',
  },
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
      // Vietmap GL JS doesn't have a proper main/module entry in package.json
      // so we need to point Vite to the correct dist file directly
      '@vietmap/vietmap-gl-js': path.resolve(__dirname, './node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.js'),
    },
  },

  server: {
    proxy: {
      '/vietmap-proxy': {
        target: 'https://maps.vietmap.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vietmap-proxy/, ''),
        headers: {
          Referer: 'https://maps.vietmap.vn/',
          Origin: 'https://maps.vietmap.vn'
        }
      }
    }
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})


