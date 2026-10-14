// Builds Creance as a shadcn registry, from the library source: apps/site/registry (the sources and
// registry.json, rewritten for copying into an app) and then, with `shadcn build`, apps/site/public/r,
// which deploys with the site at /r/<item>.json. Neither folder is committed. Run from apps/site, after
// `pnpm build` at the root (tokens.css comes from the built tokens package).
// REGISTRY_URL sets where items point for their dependencies (default https://creance.pages.dev/r).
import { runnerImport } from 'vite';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const lib = path.resolve(here, '../../../packages/react');
const src = path.join(lib, 'src');
const out = path.resolve(here, '../registry');
const publicDir = path.resolve(here, '../public/r');
const base = (process.env.REGISTRY_URL ?? 'https://creance.pages.dev/r').replace(/\/$/, '');
const layers = ['atoms', 'molecules', 'organisms', 'templates'];

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const versions = JSON.parse(fs.readFileSync(path.join(lib, 'package.json'), 'utf8')).dependencies ?? {};
const { examples } = (await runnerImport(path.resolve(here, '../src/examples.ts'), { configFile: false, logLevel: 'error' })).module;
const about = new Map(examples.map((e) => [e.name, e]));

// Where each library file goes in an app, and which item owns it.
const placed = new Map(); // absolute source path → { item, target (alias path, no extension) }
const items = [];

for (const layer of layers) {
  for (const name of fs.readdirSync(path.join(src, layer)).sort()) {
    const dir = path.join(src, layer, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const item = kebab(name);
    const files = fs.readdirSync(dir).filter((f) => /\.(tsx?|css)$/.test(f) && f !== 'index.ts' && !/\.(test|stories)\./.test(f));
    for (const f of files) placed.set(path.join(dir, f), { item, target: `components/creance/${item}/${f}` });
    // A folder import (`../Menu`) means the folder's index, which re-exports the component's own file.
    placed.set(dir, { item, target: `components/creance/${item}/${name}.tsx` });
    const e = about.get(name);
    items.push({ name: item, title: name, description: e?.about, categories: [layer.slice(0, -1), ...(e ? [e.group.toLowerCase().replace(/\s+/g, '-')] : [])], dir, files, kind: 'ui' });
  }
}

const libItem = (name, title, description, files) => {
  for (const [file, target] of files) placed.set(file, { item: name, target });
  items.push({ name, title, description, files: files.map(([file]) => file), targets: new Map(files), kind: 'lib' });
};
const internal = (f) => [path.join(src, 'internal', f), `lib/creance/${f}`];
libItem('creance-base', 'Creance base', 'Shared helpers, base styles and the design tokens every Creance component uses.', [
  // Every internal helper except the chart's, which only the charts need.
  ...fs.readdirSync(path.join(src, 'internal')).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\./.test(f) && !f.startsWith('chart.')).sort().map(internal),
  [path.resolve(lib, '../tokens/dist/tokens.css'), 'lib/creance/tokens.css'],
]);
libItem('creance-chart', 'Creance chart helpers', 'Shared layout and styles for the chart components.', ['chart.tsx', 'chart.css'].map(internal));
libItem('agent-run', 'Agent run', 'The agent event model, useAgentRun and its selectors: turn events from any agent into run state for the agent components.', [
  [path.join(src, 'events.ts'), 'lib/creance/events.ts'],
  ...['index.ts', 'reduceRun.ts', 'selectors.ts', 'useAgentRun.ts'].map((f) => [path.join(src, 'run', f), `lib/creance/run/${f}`]),
]);

// Resolves a relative specifier to a library file or folder, trying the extensions TypeScript would.
function resolve(from, spec) {
  const abs = path.resolve(path.dirname(from), spec);
  for (const candidate of [abs, `${abs}.ts`, `${abs}.tsx`]) if (placed.has(candidate)) return candidate;
  throw new Error(`${path.relative(lib, from)}: cannot place import '${spec}'`);
}

// Rewrites one file's relative imports for its place in an app, and collects what it depends on.
// shadcn apps go dark only through the .dark class (next-themes sets it, following the system when asked).
// So the registry's tokens drop their own system-setting block; otherwise Creance would turn dark on a dark
// system while the app around it stays light.
function forShadcn(file, text) {
  if (!file.endsWith('/tokens.css')) return text;
  const block = /\n@media \(prefers-color-scheme: dark\) \{\n {2}:root:where\(:not\(\[data-theme="light"\], \.light\)\) \{[^}]*\}\n\}\n/;
  if (!block.test(text)) throw new Error('tokens.css: the system-setting dark block has changed; update build-registry.mjs');
  return text.replace(block, '\n');
}

function rewrite(file, owner) {
  const deps = new Set();
  const npm = new Set();
  const own = placed.get(file).target;
  const text = forShadcn(file, fs.readFileSync(file, 'utf8')).replace(/((?:from|import)\s+')([^']+)(')/g, (all, pre, spec, post) => {
    if (!spec.startsWith('.')) {
      const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (pkg !== 'react' && pkg !== 'react-dom') {
        if (!versions[pkg]) throw new Error(`${path.relative(lib, file)}: '${pkg}' is not a dependency of @creance-ui/react`);
        npm.add(`${pkg}@${versions[pkg]}`);
      }
      return all;
    }
    const target = placed.get(resolve(file, spec));
    if (target.item !== owner) deps.add(target.item);
    // Within an item the layout is kept, so relative imports still work.
    if (target.item === owner) return all;
    const ext = path.extname(target.target);
    return `${pre}@/${ext === '.css' ? target.target : target.target.slice(0, -ext.length)}${post}`;
  });
  return { text, deps, npm, target: own };
}

fs.rmSync(out, { recursive: true, force: true });
const registry = { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'creance', homepage: 'https://creance.pages.dev', items: [] };
for (const it of items) {
  const deps = new Set(['creance-base']);
  const npm = new Set();
  const files = [];
  for (const f of it.kind === 'ui' ? it.files.map((x) => path.join(it.dir, x)) : it.files) {
    const r = rewrite(f, it.name);
    r.deps.forEach((d) => deps.add(d));
    r.npm.forEach((d) => npm.add(d));
    const local = path.join(it.name, r.target.split('/').slice(it.kind === 'ui' ? 3 : 2).join('/'));
    fs.mkdirSync(path.join(out, path.dirname(local)), { recursive: true });
    fs.writeFileSync(path.join(out, local), r.text);
    const css = f.endsWith('.css');
    files.push({ path: local, type: css ? 'registry:file' : it.kind === 'ui' ? 'registry:ui' : 'registry:lib', target: `@${r.target.split('/')[0]}/${r.target.split('/').slice(1).join('/')}` });
  }
  deps.delete(it.name);
  registry.items.push({
    name: it.name,
    type: it.kind === 'ui' ? 'registry:ui' : 'registry:lib',
    title: it.title,
    ...(it.description && { description: it.description }),
    ...(it.categories && { categories: it.categories }),
    ...(npm.size && { dependencies: [...npm].sort() }),
    ...(deps.size && { registryDependencies: [...deps].sort().map((d) => `${base}/${d}.json`) }),
    files,
    ...(it.name === 'creance-base' && {
      docs: 'Import lib/creance/tokens.css once, in your root layout (with your own import alias, for example @/lib/creance/tokens.css). Edit it to retheme. Like the rest of a shadcn app, it goes dark with the .dark class (or data-theme="dark"); to follow the system, let next-themes set the class.',
    }),
  });
}
fs.writeFileSync(path.join(out, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);

// shadcn build reads paths relative to the folder it runs in.
fs.rmSync(publicDir, { recursive: true, force: true });
try {
  execFileSync(path.resolve(here, '../node_modules/.bin/shadcn'), ['build', 'registry.json', '-o', publicDir], { cwd: out, stdio: 'pipe' });
} catch (e) {
  process.stderr.write(e.stderr ?? '');
  throw e;
}
// Someone opening /r/ in a browser gets the install instructions.
fs.writeFileSync(
  path.join(publicDir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Installation · Creance</title>
    <link rel="canonical" href="https://creance.pages.dev/#Installation" />
    <meta http-equiv="refresh" content="0; url=../#Installation" />
    <script>location.replace('../#Installation');</script>
  </head>
  <body>
    <a href="../#Installation">Installation</a>
  </body>
</html>
`,
);
console.log(`registry: ${registry.items.length} items in public/r, pointing at ${base}`);
