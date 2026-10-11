import { defineConfig, devices } from '@playwright/test';

// The Creance site: the overview and the docs. Build first: `pnpm test:site` does both.
export default defineConfig({
  testDir: 'tests',
  testMatch: 'site.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:6011', viewport: { width: 1360, height: 900 } },
  webServer: {
    command: 'pnpm --filter site exec vite preview --port 6011 --strictPort',
    url: 'http://localhost:6011',
    reuseExistingServer: !process.env.CI,
  },
});
