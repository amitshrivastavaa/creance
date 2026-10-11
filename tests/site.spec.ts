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

  // The logo leads back to the top of the overview.
  await page.getByRole('link', { name: 'Creance', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: /React UI kit/ })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(problems).toEqual([]);
});

test('every guide and every component example renders', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/#components');
  const names = await page.locator('.docs__list a').allTextContents();
  // 9 guides and 102 components.
  expect(names).toHaveLength(111);

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

test('tokens set on :root restyle components in both themes, but not past system preferences', async ({ page }) => {
  await page.goto('/#Button');
  const primary = page.locator('.doc__stage .cr-button[data-variant="primary"]').first();
  const token = (name: string) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
  await page.addStyleTag({
    content: ':root { --cr-color-accent-bg: rgb(124, 58, 237); --cr-glass-opacity-sheet: 80%; --cr-motion-duration-base: 300ms; }',
  });

  const tints: string[] = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await expect(primary, theme).toHaveCSS('background-color', 'rgb(124, 58, 237)');
    tints.push(await token('--cr-color-glass-tint'));
  }
  // Tokens that were not overridden still change with the theme.
  expect(tints[0]).not.toBe(tints[1]);
  expect(await token('--cr-glass-opacity-sheet')).toBe('80%');

  await page.emulateMedia({ contrast: 'more', reducedMotion: 'reduce' });
  expect(await token('--cr-glass-opacity-sheet')).toBe('100%');
  // The built stylesheet is minified, so zero may be written as 0s.
  expect(await token('--cr-motion-duration-base')).toMatch(/^0m?s$/);
});

test('the page describes itself to search engines and link previews', async ({ page, request }) => {
  await page.goto('/');
  const site = 'https://creance.pages.dev/';
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', site);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /React component library/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${site}og.png`);
  JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '');

  // Every file the head and the crawlers ask for is in the build.
  const icons = await page.locator('link[rel~="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
  expect(icons).toHaveLength(3);
  for (const url of [...icons, '/og.png', '/robots.txt', '/sitemap.xml']) expect((await request.get(url)).status(), url).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${site}sitemap.xml`);

  // The footer takes the version from the library's package.json.
  await expect(page.locator('.foot')).toContainText(/v\d+\.\d+\.\d+/);

  // A component page names itself in the tab.
  await page.goto('/#Table');
  await expect(page).toHaveTitle('Table · Creance');
});
