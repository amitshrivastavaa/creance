import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// axe can't measure contrast through backdrop blur or background gradients (it reports them as
// incomplete), so scan with glass kept translucent but unblurred, on a solid page background.
const measurableGlass = `
  :root { --cr-glass-filter: none !important; --cr-gradient-canvas: none !important; --cr-gradient-horizon: none !important; }
  body, .cr-run-layout, .cr-sky { background: var(--cr-color-bg-canvas) !important; }
`;

async function expectNoAxeViolations(page: Page) {
  const style = await page.addStyleTag({ content: measurableGlass });
  const { violations } = await new AxeBuilder({ page }).analyze();
  await style.evaluate((el) => el.remove());
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

async function start(page: Page) {
  await page.goto('/');
  await page.getByLabel('Speed').selectOption('4');
  await expect(page.getByRole('heading', { level: 1, name: 'Deploy Fixer' })).toBeVisible();
}

test('the demo runs the full scenario: tool calls, failure and retry, approval, diff review, handoff', async ({ page }) => {
  test.setTimeout(90_000);
  await start(page);

  // A tool call fails and the agent retries it; the retried call still shows the first failure.
  const timeline = page.getByRole('region', { name: 'Run timeline' });
  await expect(timeline.getByText('attempt 2')).toBeVisible({ timeout: 20_000 });
  await timeline.getByRole('button', { name: /run_tests/ }).click();
  await expect(page.getByRole('list', { name: 'Earlier attempts' })).toContainText('Attempt 1 failed: ECONNRESET');

  // The approval takes focus and answers to its shortcut.
  const prompt = page.getByRole('group', { name: /Deploy Fixer wants to run npm install zod@3/ });
  await expect(prompt).toBeFocused({ timeout: 20_000 });
  await expectNoAxeViolations(page);
  await page.keyboard.press('a');

  // The diff review blocks until every hunk is decided.
  const review = page.getByRole('region', { name: /Review changes to deploy\/config.yaml/ });
  await expect(review).toBeVisible({ timeout: 20_000 });
  await expectNoAxeViolations(page);
  await review.getByRole('button', { name: 'Accept all' }).click();
  await review.getByRole('button', { name: 'Apply 2 of 2' }).click();

  // The handoff banner takes focus.
  const handoff = page.getByRole('heading', { name: 'Deploy Fixer finished and handed back to you' });
  await expect(handoff).toBeFocused({ timeout: 30_000 });
  await expect(page.getByText('Completed', { exact: false }).first()).toBeVisible();
  await expectNoAxeViolations(page);

  // The inbox drawer opens, is accessible, and closes with Escape.
  await page.getByRole('button', { name: /Needs you/ }).click();
  const drawer = page.getByRole('dialog', { name: 'Inbox' });
  await expect(drawer).toBeVisible();
  await expectNoAxeViolations(page);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('denying the approval stops the run and hands back', async ({ page }) => {
  test.setTimeout(60_000);
  await start(page);
  const prompt = page.getByRole('group', { name: /wants to run npm install zod@3/ });
  await expect(prompt).toBeVisible({ timeout: 20_000 });
  await prompt.getByRole('button', { name: 'Deny' }).click();
  await expect(page.getByRole('heading', { name: 'Deploy Fixer stopped and handed back to you' })).toBeVisible({ timeout: 20_000 });
});
