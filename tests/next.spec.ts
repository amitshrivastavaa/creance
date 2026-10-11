import { expect, test, type Page } from '@playwright/test';

/** Hydration mismatches and render errors surface as console errors or page errors. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  return problems;
}

test('the server page is rendered by the server, with every component present', async ({ request }) => {
  const html = await (await request.get('/')).text();
  // No JavaScript has run: this is what the server sent.
  const names = [...html.matchAll(/data-component="([^"]+)"/g)].map((m) => m[1]);
  expect(names.length).toBeGreaterThanOrEqual(75);
  expect(new Set(names).size).toBe(names.length);
  for (const cls of ['cr-button', 'cr-tabs', 'cr-approval', 'cr-timeline', 'cr-calendar', 'cr-sky']) expect(html).toContain(cls);
});

test('the server page hydrates without errors and its client components respond', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const tabs = page.locator('[data-component="Tabs"]');
  await tabs.getByRole('tab', { name: 'Changes' }).click();
  await expect(tabs.getByRole('tabpanel')).toHaveText('Two files changed.');

  await page.locator('[data-component="Dialog"]').getByRole('button', { name: 'Stop agent' }).click();
  await expect(page.getByRole('dialog', { name: 'Stop Deploy Fixer?' })).toBeVisible();
  await page.keyboard.press('Escape');

  // Components that ran only on the server still open client menus.
  await page.locator('[data-component="DotsMenu"]').getByRole('button', { name: 'More actions for Docs Writer' }).click();
  await expect(page.getByRole('menuitem', { name: 'Open run' })).toBeVisible();
  await page.keyboard.press('Escape');

  const combo = page.locator('[data-component="Combobox"]').getByRole('combobox');
  await combo.fill('data');
  await page.keyboard.press('Enter');
  await expect(combo).toHaveValue('Data Loader');

  expect(problems).toEqual([]);
});

test('the client page hydrates, takes callbacks, and runs a screen from the simulator', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/client');
  const log = page.locator('#log');

  await page.locator('[data-component="QuestionCard"]').getByRole('button', { name: 'Answer' }).click();
  await expect(log).toHaveText('answer: staging-eu');

  const sort = page.locator('[data-component="Table"]').getByRole('columnheader', { name: 'Tokens' });
  await sort.getByRole('button').click();
  await expect(sort).toHaveAttribute('aria-sort', 'ascending');

  const kill = page.locator('[data-component="KillSwitch"]');
  await kill.getByRole('button', { name: 'Hold to stop' }).focus();
  await page.keyboard.down('Space');
  await expect(kill.getByRole('status')).toBeVisible();
  await page.keyboard.up('Space');

  // The simulated run pauses on an approval; allowing it lets the run continue.
  const sim = page.locator('[data-component="Simulated run"]');
  await sim.getByRole('button', { name: /Allow once/ }).click();
  await expect(sim.getByRole('button', { name: /Allow once/ })).toBeHidden();

  expect(problems).toEqual([]);
});
