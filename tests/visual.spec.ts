import { expect, test } from '@playwright/test';

const stories = [
  'atoms-button--group',
  'atoms-badge--all-statuses',
  'atoms-form-controls--checks',
  'atoms-form-controls--switches',
  'molecules-budgetmeter--near-limit',
  'molecules-diffline--sequence',
  'molecules-toolcallheader--retried',
  'molecules-core-controls--fields',
  'molecules-core-controls--menu-open',
  'molecules-core-controls--alerts',
  'molecules-inputs--choicebox-story',
  'molecules-inputs--sliders',
  'molecules-inputs--toggles',
  'molecules-inputs--calendar-range',
  'molecules-inputs--actions',
  'molecules-navigation--breadcrumbs-story',
  'molecules-navigation--pagination-story',
  'molecules-navigation--collapse-story',
  'molecules-navigation--scroller-story',
  'molecules-data-display--table-story',
  'molecules-data-display--file-tree-story',
  'molecules-data-display--json-view-story',
  'molecules-data-display--details',
  'molecules-data-display--measures',
  'molecules-data-display--snippets',
  'molecules-data-display--empty',
  'molecules-feedback-and-media--banners',
  'molecules-feedback-and-media--errors',
  'molecules-feedback-and-media--frames',
  'molecules-feedback-and-media--video-player',
  'organisms-agent-controls--plan',
  'organisms-agent-controls--questions',
  'organisms-agent-controls--kill-switch-states',
  'organisms-agent-controls--checkpoints',
  'organisms-agent-controls--permissions',
  'organisms-agent-controls--confidence',
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
      // fonts.ready can resolve before a weight that has not been requested yet starts loading, which
      // let semibold labels render in a fallback font now and then. Load every face the kit uses first.
      await page.evaluate(() =>
        Promise.all(
          ['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 16px Inter`)).concat(
            ['400', '600'].map((w) => document.fonts.load(`${w} 16px "JetBrains Mono"`)),
          ),
        ),
      );
      await page.evaluate(() => document.fonts.ready);
      // FleetSky draws on a canvas after layout: wait until it has painted something.
      await page.waitForFunction(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('.cr-sky__canvas');
        if (!canvas) return true;
        const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
        return data.some((v, i) => i % 4 === 3 && v > 0);
      });
      await page.waitForTimeout(300);
      const target = id.startsWith('templates-') ? page : page.locator('#storybook-root');
      await expect(target).toHaveScreenshot(`${id}-${theme}.png`);
    });
  }
}
