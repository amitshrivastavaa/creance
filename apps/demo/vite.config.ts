import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Consumes the built `creance` package (dist), exactly as an app would. Run `pnpm build` at the root first.
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the demo from a sub-path.
  base: process.env.DEMO_BASE ?? '/',
});
