import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages - update 'PancakeGame' to match your repo name
  base: '/PancakeGame/',
  server: {
    port: 3000,
    open: true,
    host: true // Allow access from mobile devices on local network
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['three', 'cannon-es']
  }
});
