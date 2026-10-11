// Assembles the single-page build: the markup from index.html with the styles inlined, and the
// script beside it. The page is a fragment with no <html> or <body>, which is what the publishing
// target expects. Output: artifact/creance-ui-kit.html and artifact/creance-playground.js.
import { copyFile, readFile, writeFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const title = /<title>.*<\/title>/.exec(html)[0];
const fonts = /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>/.exec(html)[0];
const body = /<!-- page:start -->\n([\s\S]*?)\n<!-- page:end -->/.exec(html)[1];
const css = await readFile('artifact/build/site.css', 'utf8');

await writeFile('artifact/creance-ui-kit.html', `${title}\n${fonts}\n<style>\n${css}\n</style>\n\n${body}\n<script src="creance-playground.js"></script>\n`);
await copyFile('artifact/build/creance-playground.js', 'artifact/creance-playground.js');
console.log('artifact: artifact/creance-ui-kit.html and artifact/creance-playground.js');
