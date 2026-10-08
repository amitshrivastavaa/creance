import { expect, test } from '@playwright/test';

const stories = [
  'atoms-button--group',
  'atoms-badge--all-statuses',
  'molecules-budgetmeter--near-limit',
  'molecules-diffline--sequence',
  'molecules-toolcallheader--retried',
  'organisms-approvalprompt--default',
  'organisms-approvalprompt--high-risk',
  'organisms-toolcallcard--error',
  'organisms-runtimeline--waiting-for-approval',
  'organisms-diffreview--default',
  'organisms-needsyouinbox--default',
  'organisms-agenthandoffbanner--completed',
  'organisms-fleetsky--needs-you',
  'templates-agentrunlayout--waiting-for-approval',
  'templates-agentrunlayout--completed',
];

for (const theme of ['light', 'dark'] as const) {
  for (const id of stories) {
    test(`${id} (${theme})`, async ({ page }) => {
      // Durations ("Running · 12s") and inbox ages are computed from Date.now().
      await page.clock.setFixedTime(new Date('2026-10-01T12:00:00Z'));
      await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
      await page.locator('#storybook-root > *').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      const target = id.startsWith('templates-') ? page : page.locator('#storybook-root');
      await expect(target).toHaveScreenshot(`${id}-${theme}.png`);
    });
  }
}
