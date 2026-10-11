import { defineConfig, devices } from '@playwright/test';

// Creance inside the Next.js App Router: server rendering, hydration and interaction.
// Build first: `pnpm test:next` does both.
export default defineConfig({
  testDir: 'tests',
  testMatch: 'next.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:6010' },
  webServer: {
    command: 'pnpm --filter next-app start',
    url: 'http://localhost:6010',
    reuseExistingServer: !process.env.CI,
  },
});
