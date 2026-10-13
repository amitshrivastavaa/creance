// Checks the built registry in public/r. Run `node scripts/build-registry.mjs` first (the site build does).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const dir = path.resolve(import.meta.dirname, '../public/r');
const index = JSON.parse(fs.readFileSync(path.join(dir, 'registry.json'), 'utf8'));
const items = new Map(index.items.map((i) => [i.name, JSON.parse(fs.readFileSync(path.join(dir, `${i.name}.json`), 'utf8'))]));
// Where every file lands in an app (alias stripped), and which item installs it.
const owner = new Map([...items.values()].flatMap((i) => i.files.map((f) => [f.target.replace(/^@/, ''), i.name])));
const imports = (text) => [...text.matchAll(/(?:from|import)\s+'([^']+)'/g)].map((m) => m[1]);
const find = (p) => [p, `${p}.ts`, `${p}.tsx`].find((c) => owner.has(c));

test('every component is an item, plus the three shared libraries', () => {
  const ui = [...items.values()].filter((i) => i.type === 'registry:ui');
  assert.equal(ui.length, 109);
  assert.deepEqual([...items.values()].filter((i) => i.type === 'registry:lib').map((i) => i.name).sort(), ['agent-run', 'creance-base', 'creance-chart']);
});

test('every import resolves to a file the item or one of its dependencies installs', () => {
  for (const item of items.values()) {
    const reachable = new Set([item.name, ...(item.registryDependencies ?? []).map((u) => path.basename(u, '.json'))]);
    for (const f of item.files) {
      const at = f.target.replace(/^@/, '');
      for (const spec of imports(f.content)) {
        let file;
        if (spec.startsWith('.')) file = find(path.posix.join(path.posix.dirname(at), spec));
        else if (spec.startsWith('@/')) file = find(spec.slice(2));
        else continue;
        assert.ok(file, `${item.name}: '${spec}' in ${at} does not resolve to an installed file`);
        assert.ok(reachable.has(owner.get(file)), `${item.name}: '${spec}' comes from ${owner.get(file)}, which is not a dependency`);
        if (spec.startsWith('.')) assert.equal(owner.get(file), item.name, `${item.name}: relative import '${spec}' leaves the item`);
      }
    }
  }
});

test('every dependency names an item that exists, and every npm import is declared', () => {
  for (const item of items.values()) {
    for (const url of item.registryDependencies ?? []) assert.ok(items.has(path.basename(url, '.json')), `${item.name}: unknown dependency ${url}`);
    const declared = (item.dependencies ?? []).map((d) => d.replace(/@[^@/]*$/, ''));
    for (const spec of item.files.flatMap((f) => imports(f.content))) {
      if (spec.startsWith('.') || spec.startsWith('@/') || spec === 'react' || spec.startsWith('react/') || spec === 'react-dom') continue;
      assert.ok(declared.some((d) => spec === d || spec.startsWith(`${d}/`)), `${item.name}: '${spec}' is imported but not declared`);
    }
  }
});

test('the tokens follow the .dark class only, like a shadcn app, and the base item says how to load them', () => {
  const base = items.get('creance-base');
  const tokens = base.files.find((f) => f.target.endsWith('tokens.css')).content;
  assert.match(tokens, /\.dark\)/);
  assert.doesNotMatch(tokens, /prefers-color-scheme: dark/);
  assert.match(base.docs, /tokens\.css/);
});
