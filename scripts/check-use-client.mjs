// Fails if a component file needs "use client" and lacks it, or if the build dropped the directive.
// React's server build has no state, effects, refs or context, and server components cannot attach
// event handlers, so any file that uses those must be a client module for Next.js's App Router.
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';

const root = 'packages/react/src';
const dist = 'packages/react/dist';
const needs = {
  'state, effects, refs or context': /\b(useState|useEffect|useRef|useLayoutEffect|useSyncExternalStore|useImperativeHandle|useReducer|useContext|createContext|useInsertionEffect|useTransition|useDeferredValue)\b/,
  'a class component': /extends (React\.)?(Pure)?Component\b/,
  'a Radix import': /from '@radix-ui\//,
  'its own event handler': /\son[A-Z]\w*=\{/,
  // Member access only, so prose such as "inside a window." in a comment does not count.
  'a browser global': /\b(window|document|navigator|localStorage)(\?\.|\.)[A-Za-z_]/,
  'a local hook': /import \{[^}]*\buse[A-Z]\w*[^}]*\} from '\.\.?\//,
};
const marked = (text) => /^\s*['"]use client['"]/.test(text);

const files = (await readdir(root, { recursive: true })).filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.') && !f.endsWith('test-setup.ts') && !f.endsWith('index.ts'));
let failures = 0;
let client = 0;
for (const file of files) {
  const text = await readFile(`${root}/${file}`, 'utf8');
  const why = Object.entries(needs).find(([, re]) => re.test(text.replace(/^\s*['"]use client['"];?/, '')))?.[0];
  if (why && !marked(text)) {
    console.error(`${root}/${file}: uses ${why}, so it needs 'use client' as its first line`);
    failures++;
  }
  if (!marked(text)) continue;
  client++;
  // The build names a module X2.js when X.js is taken by the folder's index.
  const base = `${dist}/${file.replace(/\.tsx?$/, '')}`;
  const built = [`${base}2.js`, `${base}.js`].find((p) => existsSync(p));
  if (existsSync(dist) && built && !marked(await readFile(built, 'utf8'))) {
    console.error(`${built}: the build dropped 'use client'`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-use-client: ${client} client files marked, ${files.length - client} usable in server components`);
