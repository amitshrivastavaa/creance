// The sample project the agent works on. It lives in memory: nothing here reads or writes your disk.
// Its build fails for the same two reasons as the Creance demo: zod is imported but not a dependency,
// and the deploy config allows too few retries for the (pretend) flaky registry.

export type Files = Record<string, string>;

export const initialFiles: Files = {
  'web/package.json': `{
  "name": "web",
  "private": true,
  "dependencies": {
    "react": "^19.3.0",
    "react-dom": "^19.3.0"
  }
}
`,
  'web/src/App.tsx': `import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
`,
  'web/server/validate.ts': `import { z } from 'zod';

export const signup = z.object({ email: z.string().email(), name: z.string().min(1) });
`,
  'deploy/config.yaml': `service: web
retries: 1
timeout: 30
`,
};

/** The project as of this request: the starting files plus every change already made in the conversation. */
export class Project {
  files: Files;
  constructor(files: Files = initialFiles) {
    this.files = { ...files };
  }

  install(name: string, version: string) {
    const pkg = JSON.parse(this.files['web/package.json']!) as { dependencies: Record<string, string> };
    pkg.dependencies[name] = version;
    pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)));
    this.files['web/package.json'] = `${JSON.stringify(pkg, null, 2)}\n`;
  }

  write(path: string, content: string) {
    this.files[path] = content;
  }

  /** Two checks stand in for the build and the deploy. Deterministic, and nothing is executed. */
  check() {
    const deps = (JSON.parse(this.files['web/package.json']!) as { dependencies: Record<string, string> }).dependencies;
    const failures: string[] = [];
    for (const [path, text] of Object.entries(this.files)) {
      if (!/\.(ts|tsx)$/.test(path)) continue;
      for (const [, name] of text.matchAll(/from '([^.'][^']*)'/g)) {
        if (!deps[name!]) failures.push(`build: ${path} imports "${name}", which is not in web/package.json`);
      }
    }
    const retries = Number(/^retries:\s*(\d+)/m.exec(this.files['deploy/config.yaml'] ?? '')?.[1] ?? 0);
    if (retries < 2) failures.push(`deploy: the registry is flaky, so deploy/config.yaml needs retries of at least 2 (it has ${retries})`);
    return { passed: failures.length === 0, failures };
  }
}
