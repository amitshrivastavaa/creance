import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
      cssFileName: 'styles',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@radix-ui\//],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
