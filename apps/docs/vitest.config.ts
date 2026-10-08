import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// Every story renders in Chromium and runs axe, once per colour scheme.
// a11y.test = 'error' in preview.ts makes violations fail. The default theme is 'system', so the
// emulated prefers-color-scheme picks light or dark tokens.
export default defineConfig({
  plugins: [storybookTest({ configDir: '.storybook' })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [
        { browser: 'chromium', name: 'light', provider: playwright({ contextOptions: { colorScheme: 'light' } }) },
        { browser: 'chromium', name: 'dark', provider: playwright({ contextOptions: { colorScheme: 'dark' } }) },
      ],
    },
  },
});
