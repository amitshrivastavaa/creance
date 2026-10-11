import { expect, test, type Page } from '@playwright/test';

function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  return problems;
}
// The docs heading. AgentRunLayout is a page template and brings a heading of its own.
const title = (page: Page) => page.locator('.doc__head h1');

test('the overview shows the demo run and leads into the docs', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/');
  await page.getByRole('button', { name: /Allow once/ }).click();
  await expect(page.locator('#demo-outcome-title')).toHaveText('Deploy Fixer finished and handed back to you');

  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(title(page)).toHaveText('Introduction');
  await page.getByRole('link', { name: 'Overview' }).click();
  await page.getByRole('link', { name: 'Browse components', exact: true }).click();
  await expect(title(page)).toHaveText('Button');
  expect(problems).toEqual([]);
});

test('every guide and every component example renders', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/#components');
  const names = await page.locator('.docs__list a').allTextContents();
  // 9 guides and 90 components.
  expect(names).toHaveLength(99);

  for (const name of names) {
    await page.evaluate((n) => window.creanceGo?.(n), name);
    await expect(title(page)).toHaveText(name);
    // An example that fails to parse or throws shows a problem line; a stage must not be empty.
    await expect(page.locator('.doc__problem'), name).toHaveCount(0);
    const empty = await page.locator('.doc__stage').evaluateAll((stages) => stages.filter((s) => s.innerHTML.length < 20).length);
    expect(empty, name).toBe(0);
  }
  expect(problems).toEqual([]);
});

test('editing an example updates its preview, and a mistake is explained', async ({ page }) => {
  await page.goto('/#Button');
  const stage = page.locator('.doc__stage').first();
  const code = page.locator('#pg-code');

  await code.fill('<Button variant="danger" onClick={log}>Edited live</Button>');
  const edited = stage.getByRole('button', { name: 'Edited live' });
  await expect(edited).toHaveAttribute('data-variant', 'danger');
  await edited.click();
  await expect(page.locator('.doc__events').first()).toContainText('onClick(event)');

  // A typo keeps the last preview on screen and says what is wrong.
  await code.fill('<Button>Edited live</Buton>');
  await expect(page.locator('.doc__problem')).toHaveText('Line 1: expected </Button> but found </Buton>');
  await expect(edited).toBeVisible();

  // Code is read, never executed: scripts and operators are refused.
  await code.fill('<script>alert(1)</script>');
  await expect(page.locator('.doc__problem')).toContainText('not allowed');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('.doc__problem')).toHaveCount(0);
});

test('each component page has props, and search finds pages', async ({ page }) => {
  await page.goto('/#ApprovalPrompt');
  await expect(page.locator('#ref-props')).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /^onAllow/ })).toBeVisible();
  await expect(page.locator('#ref-keys')).toBeVisible();

  await page.getByRole('button', { name: /Search/ }).click();
  await page.keyboard.type('rewind');
  await page.keyboard.press('Enter');
  await expect(title(page)).toHaveText('CheckpointRewind');
});
