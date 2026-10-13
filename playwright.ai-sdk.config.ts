import { defineConfig, devices } from '@playwright/test';

// The AI SDK example, against its scripted model (MOCK=1), so no key or network is needed.
// Build first: `pnpm test:ai-sdk` does both.
export default defineConfig({
  testDir: 'tests',
  testMatch: 'ai-sdk.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:6031', viewport: { width: 1360, height: 900 } },
  webServer: {
    command: 'pnpm --filter ai-sdk-example exec next start --port 6031',
    env: { MOCK: '1' },
    url: 'http://localhost:6031',
    reuseExistingServer: !process.env.CI,
  },
});
