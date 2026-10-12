// Takes the screenshots on the Examples page from the built apps, in both themes, into public/examples/thumbs.
// Build first: `pnpm build` at the root, `pnpm --filter site build` and `pnpm --filter demo build`.
// Then: `pnpm --filter site thumbs`.
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const out = new URL('../public/examples/thumbs/', import.meta.url).pathname;
const site = await preview({ root: new URL('..', import.meta.url).pathname, preview: { port: 6021, strictPort: true }, logLevel: 'silent' });
const demo = await preview({ root: new URL('../../demo', import.meta.url).pathname, preview: { port: 6022, strictPort: true }, logLevel: 'silent' });

const shots = [
  { id: 'operations', url: 'http://localhost:6021/examples/operations/#overview' },
  { id: 'assistant', url: 'http://localhost:6021/examples/assistant/#build-482' },
  { id: 'review', url: 'http://localhost:6021/examples/review/' },
  { id: 'sign-in', url: 'http://localhost:6021/examples/sign-in/' },
  { id: 'mobile', url: 'http://localhost:6021/examples/mobile/' },
  // The demo plays its run; wait until the agent asks for approval.
  { id: 'demo', url: 'http://localhost:6022/', ready: (page) => page.getByRole('button', { name: /Allow once/ }).waitFor({ timeout: 30_000 }) },
];

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  // Half scale: 720 by 450, sharp enough for a tile.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.5, colorScheme: scheme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const shot of shots) {
    await page.goto(shot.url);
    await (shot.ready?.(page) ?? page.waitForLoadState('networkidle'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}${shot.id}-${scheme}.jpg`, type: 'jpeg', quality: 82 });
    console.log(`${shot.id}-${scheme}.jpg`);
  }
  await context.close();
}
await browser.close();
site.httpServer.close();
demo.httpServer.close();
