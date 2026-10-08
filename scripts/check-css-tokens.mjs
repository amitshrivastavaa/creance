// Fails if component CSS uses a raw colour instead of a --cr-* token.
import { readFile, readdir } from 'node:fs/promises';

const root = 'packages/react/src';
const raw = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/i;
const files = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.css'));

let failures = 0;
for (const file of files) {
  const lines = (await readFile(`${root}/${file}`, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    if (raw.test(line)) {
      console.error(`${root}/${file}:${i + 1}: raw colour, use a token: ${line.trim()}`);
      failures++;
    }
  });
}
if (failures) process.exit(1);
console.log(`check-css-tokens: ${files.length} files, no raw colours`);
