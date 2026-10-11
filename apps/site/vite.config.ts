import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// The footer shows the library's version. Vite fills %VITE_CREANCE_VERSION% in index.html from this.
process.env.VITE_CREANCE_VERSION = JSON.parse(readFileSync(new URL('../../packages/react/package.json', import.meta.url), 'utf8')).version;

// The Creance site: an overview and the docs, with every component running live.
// It consumes the built packages, as an app would. Run `pnpm build` at the root first.
export default defineConfig({
  plugins: [react()],
  // Relative paths, so the build works at a site root or under any sub-path.
  base: './',
});
