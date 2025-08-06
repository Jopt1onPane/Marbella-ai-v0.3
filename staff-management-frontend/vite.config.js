import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        entryFileNames: `assets/modern-ui-[hash].js`,
        chunkFileNames: `assets/modern-chunk-[hash].js`,
        assetFileNames: `assets/modern-[name]-[hash].[ext]`
      }
    }
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify('8.0.0'),
    __FORCE_REBUILD__: JSON.stringify(Date.now()),
    __UI_MODE__: JSON.stringify('MODERN_UI_FIXED'),
  }
})

