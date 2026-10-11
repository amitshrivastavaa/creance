// Draws the images in public/ that are not written by hand: the PNG and ICO favicons, the Apple
// touch icon, and the card shown when a link to the site is shared (og.png).
// Run after changing the logo or the card: pnpm --filter site images
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dirname, '../public');
const shot = readFileSync(join(import.meta.dirname, '../../../docs/images/demo.png')).toString('base64');
// The mark from favicon.svg. `square` fills the whole tile, which is what iOS expects.
const mark = (square) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect x="${square ? 0 : 1}" y="${square ? 0 : 1}" width="${square ? 32 : 30}" height="${square ? 32 : 30}" rx="${square ? 0 : 9}" fill="#1d1d1f"/>
    <path d="M21.6 11.3A7.4 7.4 0 1 0 21.6 20.7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="21.6" cy="11.3" r="2.3" fill="#fff"/>
  </svg>`;

const card = `
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" />
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, system-ui, sans-serif; color: #1d1d1f;
      background: radial-gradient(900px 500px at 8% -10%, #c9d8ee 0%, transparent 60%), radial-gradient(800px 520px at 100% 0%, #e3d9ee 0%, transparent 60%), #e9ebef; }
    .copy { position: absolute; left: 72px; top: 72px; width: 500px; }
    .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; }
    .brand svg { width: 44px; height: 44px; }
    h1 { margin-top: 92px; font-size: 62px; line-height: 1.04; font-weight: 700; letter-spacing: -0.035em; }
    p { margin-top: 28px; font-size: 26px; line-height: 1.35; font-weight: 500; color: #5f6368; }
    .shot { position: absolute; left: 620px; top: 84px; width: 900px; border-radius: 22px; border: 1px solid rgb(255 255 255 / 0.8);
      box-shadow: 0 30px 80px rgb(20 30 60 / 0.22); }
  </style>
  <div class="copy">
    <div class="brand">${mark(false)}Creance</div>
    <h1>A React UI kit for supervising AI agents</h1>
    <p>95 open-source components. Light, dark and solid themes.</p>
  </div>
  <img class="shot" src="data:image/png;base64,${shot}" alt="" />`;

/** An ICO file that holds one PNG, which every current browser accepts. */
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // where the PNG starts
  return Buffer.concat([header, png]);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(card, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, 'og.png') });

  const icon = async (size, square) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${mark(square)}`);
    return page.screenshot({ omitBackground: true });
  };
  writeFileSync(join(out, 'apple-touch-icon.png'), await icon(180, true));
  writeFileSync(join(out, 'favicon.ico'), ico(await icon(32, false), 32));
} finally {
  await browser.close();
}
console.log('Wrote og.png, apple-touch-icon.png and favicon.ico to public/');
