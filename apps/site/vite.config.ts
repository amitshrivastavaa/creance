import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// The footer shows the library's version. Vite fills %VITE_CREANCE_VERSION% in index.html from this.
process.env.VITE_CREANCE_VERSION = JSON.parse(readFileSync(new URL('../../packages/react/package.json', import.meta.url), 'utf8')).version;

// The theme follows you from page to page, and to the demo: every page restores the saved choice
// before it paints, then saves whatever ThemeSwitcher sets on <html>. The demo's index.html has the same script.
const rememberTheme = `try{var r=document.documentElement,k='creance-theme',t=localStorage.getItem(k);if(t==='light'||t==='dark')r.dataset.theme=t;new MutationObserver(function(){r.dataset.theme?localStorage.setItem(k,r.dataset.theme):localStorage.removeItem(k)}).observe(r,{attributeFilter:['data-theme']})}catch(e){}`;

// The Creance site: an overview and the docs, with every component running live.
// It consumes the built packages, as an app would. Run `pnpm build` at the root first.
export default defineConfig({
  plugins: [react(), { name: 'remember-theme', transformIndexHtml: () => [{ tag: 'script', children: rememberTheme, injectTo: 'head-prepend' }] }],
  // Relative paths, so the build works at a site root or under any sub-path.
  base: './',
  // The docs at the root, and sample apps built from the kit under /examples/.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        operations: 'examples/operations/index.html',
        assistant: 'examples/assistant/index.html',
        review: 'examples/review/index.html',
        signIn: 'examples/sign-in/index.html',
        mobile: 'examples/mobile/index.html',
      },
    },
  },
});
