// Installs Creance from its shadcn registry into a fresh shadcn project, the way a developer would, and checks
// the result builds, typechecks and works: builds the registry pointing at a local server, copies
// tests/registry-fixture (Next.js + Tailwind + shadcn, with ~/ aliases) to a temporary folder, runs
// `shadcn add` for a few items, then tsc, next build, and tests/registry.spec.ts against next start.
// Needs `pnpm build` first, and the network for npm install. Run from the repo root: `pnpm test:registry`.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'apps/site');
const publicDir = path.join(site, 'public');
const registryPort = 6051;
const appPort = 6052;
const items = ['approval-prompt', 'chat', 'run-timeline', 'agent-run'];
// Asynchronous, so the registry server below, in this same process, can answer while a command runs.
const run = (cmd, args, cwd, env = {}) =>
  new Promise((resolve, reject) => {
    spawn(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } }).on('exit', (code) =>
      code === 0 ? resolve() : reject(Object.assign(new Error(`${cmd} ${args[0]} exited with ${code}`), { status: code })),
    );
  });

await run('node', ['scripts/build-registry.mjs'], site, { REGISTRY_URL: `http://127.0.0.1:${registryPort}/r` });

const server = http
  .createServer((req, res) => {
    const file = path.join(publicDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(publicDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': 'application/json' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(registryPort, '127.0.0.1');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'creance-registry-'));
let app;
try {
  fs.cpSync(path.join(root, 'tests/registry-fixture'), dir, { recursive: true });
  await run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], dir);
  await run('npx', ['shadcn', 'add', ...items.map((i) => `http://127.0.0.1:${registryPort}/r/${i}.json`), '--yes'], dir);

  // The CLI should have mapped the registry's @/ imports to this project's ~/ aliases.
  const installed = fs.readdirSync(dir, { recursive: true }).filter((f) => /^(components|lib)\/creance\/.*\.tsx?$/.test(f));
  const leftover = installed.filter((f) => /from '@\//.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  if (!installed.length || leftover.length) throw new Error(`imports not mapped to ~/: ${leftover.join(', ') || 'nothing installed'}`);
  console.log(`registry-smoke: ${installed.length} files installed, imports use ~/`);

  await run('npx', ['tsc', '--noEmit'], dir);
  await run('npm', ['run', 'build'], dir);
  app = spawn('npm', ['run', 'start', '--', '-p', String(appPort)], { cwd: dir, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    const up = await fetch(`http://127.0.0.1:${appPort}/`).then((r) => r.ok, () => false);
    if (up) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  await run('pnpm', ['exec', 'playwright', 'test', '-c', 'playwright.registry.config.ts'], root, { REGISTRY_APP_URL: `http://127.0.0.1:${appPort}` });
  fs.rmSync(dir, { recursive: true, force: true });
} catch (e) {
  console.error(`registry-smoke failed; the project is left at ${dir}`);
  process.exitCode = 1;
  if (!(e instanceof Error && 'status' in e)) console.error(e);
} finally {
  app?.kill();
  server.close();
}
