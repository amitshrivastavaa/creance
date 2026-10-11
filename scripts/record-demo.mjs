// Records the README media from the demo app: docs/images/demo.gif and docs/images/demo.png.
// Needs ffmpeg. Usage: pnpm build && pnpm --filter demo build && node scripts/record-demo.mjs
import { chromium } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const server = spawn('pnpm', ['--filter', 'demo', 'exec', 'vite', 'preview', '--port', '6010', '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const videoDir = mkdtempSync(join(tmpdir(), 'creance-video-'));
const size = { width: 1280, height: 800 };
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: size, recordVideo: { dir: videoDir, size }, colorScheme: 'light' });
  const page = await context.newPage();
  const pause = (ms) => page.waitForTimeout(ms);

  await page.goto('http://localhost:6010/');
  await page.getByLabel('Speed').selectOption('2');
  const prompt = page.getByRole('group', { name: /wants to run/ });
  await prompt.waitFor({ timeout: 30_000 });
  await pause(1_200);
  await page.screenshot({ path: 'docs/images/demo.png' });
  await page.keyboard.press('a');

  const review = page.getByRole('region', { name: /Review changes/ });
  await review.waitFor({ timeout: 30_000 });
  await pause(800);
  await review.getByRole('button', { name: 'Accept' }).first().click();
  await pause(500);
  await page.keyboard.press('j');
  await pause(400);
  await page.keyboard.press('y');
  await pause(700);
  await review.getByRole('button', { name: /^Apply/ }).click();

  await page.getByRole('heading', { name: /handed back/ }).waitFor({ timeout: 30_000 });
  await pause(2_000);
  await context.close();
} finally {
  await browser.close();
  server.kill();
}

const video = join(videoDir, readdirSync(videoDir)[0]);
const filters = 'fps=8,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=5';
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vf', filters, 'docs/images/demo.gif']);
console.log('Wrote docs/images/demo.gif and docs/images/demo.png');
