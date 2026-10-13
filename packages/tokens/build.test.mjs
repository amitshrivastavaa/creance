// Checks the generated tokens.css. Run after `pnpm build`.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const css = await readFile(new URL('./dist/tokens.css', import.meta.url), 'utf8');

test('dark follows data-theme or the .dark class', () => {
  assert.match(css, /^:root:where\(\[data-theme="dark"\], \.dark\) \{\n {2}color-scheme: dark;/m);
});

test('the system dark setting applies unless data-theme or the .light class asks for light', () => {
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n {2}:root:where\(:not\(\[data-theme="light"\], \.light\)\) \{/);
});
