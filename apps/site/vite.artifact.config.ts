import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// One script and one stylesheet, for publishing the site as a single self-contained page.
// scripts/build-artifact.mjs assembles them with the markup from index.html.
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'artifact/build',
    cssCodeSplit: false,
    lib: { entry: 'src/main.tsx', formats: ['iife'], name: 'CreanceSite', fileName: () => 'creance-playground.js', cssFileName: 'site' },
  },
});
