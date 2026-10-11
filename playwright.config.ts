import { defineConfig, devices } from '@playwright/test';

// Two suites:
// - visual: screenshots of key Storybook stories in light and dark, against the static Storybook build.
// - demo: drives the demo app through the full scenario, with axe checks along the way.
// Baselines are Linux screenshots from the Playwright Docker image, the same image CI runs in.
// Update them with `pnpm test:visual:update`. VISUAL_BASE_URL points the visual suite at an existing server.
const visualBase = process.env.VISUAL_BASE_URL;

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: 'tests/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } },
  expect: { toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide' } },
  projects: [
    // Reduced motion draws FleetSky still, so its screenshots are deterministic.
    // Retries: now and then a small right-aligned label lands a sub-pixel off, on a different story each
    // run. The cause is not found. A real regression still fails all three attempts; the jitter is
    // reported as flaky instead of failing the build.
    { name: 'visual', testMatch: 'visual.spec.ts', retries: 2, use: { baseURL: visualBase ?? 'http://localhost:6008', reducedMotion: 'reduce' } },
    { name: 'demo', testMatch: 'demo.spec.ts', use: { baseURL: 'http://localhost:6009' } },
  ],
  webServer: visualBase ? [] : [
    {
      command: 'pnpm --filter docs exec vite preview --outDir storybook-static --port 6008 --strictPort',
      url: 'http://localhost:6008/iframe.html',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter demo exec vite preview --port 6009 --strictPort',
      url: 'http://localhost:6009',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
