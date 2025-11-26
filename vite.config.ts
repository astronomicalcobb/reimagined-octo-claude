import { defineConfig } from 'vite'

export default defineConfig({
  root: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@core': '/src/core',
      '@entities': '/src/entities',
      '@systems': '/src/systems',
      '@utils': '/src/utils',
      '@physics': '/src/physics',
      '@world': '/src/world',
      '@ui': '/src/ui',
      '@game-modes': '/src/game-modes',
      '@types': '/src/types'
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
