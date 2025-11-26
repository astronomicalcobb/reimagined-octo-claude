import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@physics': path.resolve(__dirname, './src/physics'),
      '@world': path.resolve(__dirname, './src/world'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@game-modes': path.resolve(__dirname, './src/game-modes'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'rapier': ['@dimforge/rapier3d-compat']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat']
  }
})
