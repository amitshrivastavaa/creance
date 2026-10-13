import { defineConfig, devices } from '@playwright/test';

// A shadcn project with Creance installed from the registry. scripts/registry-smoke.mjs builds and serves it,
// then runs this: `pnpm test:registry`.
export default defineConfig({
  testDir: 'tests',
  testMatch: 'registry.spec.ts',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: process.env.REGISTRY_APP_URL ?? 'http://127.0.0.1:6052', viewport: { width: 1280, height: 900 } },
});
