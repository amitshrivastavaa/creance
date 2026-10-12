import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

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
  // 9 guides and 109 components.
  expect(names).toHaveLength(118);

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

test('llms.txt links a markdown file for every guide and component', async ({ page, request }) => {
  await page.goto('/#components');
  const names = await page.locator('.docs__list a').allTextContents();
  const index = await (await request.get('/llms.txt')).text();
  for (const name of names) expect(index, name).toContain(`(https://creance.pages.dev/docs/${name}.md)`);

  const doc = await request.get('/docs/ApprovalPrompt.md');
  expect(doc.status()).toBe(200);
  const md = await doc.text();
  expect(md).toContain("import { ApprovalPrompt } from '@creance-ui/react';");
  expect(md).toContain('| Prop | Type | Default | Description |');
  expect(md).toMatch(/^\| `onAllow` \|/m);
  expect((await request.get('/llms-full.txt')).status()).toBe(200);
});

test('the Chat example answers what is typed, streaming a reply and then citing a source', async ({ page }) => {
  await page.goto('/#Chat');
  const stage = page.locator('.doc__stage').first();
  await stage.getByRole('textbox', { name: 'Message Deploy Fixer' }).fill('Is it the build or the tests?');
  await page.keyboard.press('Enter');
  await expect(stage.getByText('Is it the build or the tests?')).toBeVisible();
  // While the agent works, Send is Stop.
  await expect(stage.getByRole('button', { name: 'Stop' })).toBeVisible();
  await expect(stage.getByRole('link', { name: /Build 482 log/ })).toBeVisible({ timeout: 15_000 });
  await expect(stage.getByRole('button', { name: 'Send' })).toBeVisible();
});

// The example apps under /examples/, built only from the kit, and the gallery that lists them.
const pages = [
  ...['overview', 'inbox', 'runs', 'run/r41', 'agents', 'permissions', 'budgets', 'integrations', 'audit-log', 'settings'].map((s) => `/examples/operations/#${s}`),
  '/examples/',
  '/examples/assistant/',
  '/examples/assistant/#build-482',
  '/examples/review/',
  '/examples/sign-in/',
  '/examples/sign-in/#setup',
  '/examples/mobile/',
];

test('every example page renders without errors or axe violations, in both themes', async ({ page }) => {
  const problems = watch(page);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const url of pages) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 }), url).toBeAttached();
      await expectNoAxeViolations(page);
    }
  }
  expect(problems).toEqual([]);
});

test('the example pages fit a phone without scrolling sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of pages) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(390);
  }
});

test('the gallery lists every example, each with a screenshot in both themes', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'See example apps' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Examples' })).toBeVisible();
  const titles = page.locator('.ex-tile h2 a');
  await expect(titles).toHaveCount(6);
  for (const src of await page.locator('.ex-tile img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src))) {
    expect((await request.get(src)).status(), src).toBe(200);
  }
  // Each example opens in a new tab.
  const [tab] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Agent operations (opens in a new tab)' }).click()]);
  await expect(tab).toHaveTitle(/Overview · Acme/);
});

test('answering in the operations inbox moves the run on', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/examples/operations/');
  await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: /Inbox/ }).click();
  await page.getByRole('button', { name: /Allow once/ }).click();
  await expect(page.getByRole('button', { name: /Needs you/ })).toContainText('4');

  // The run already shows what happened after the approval.
  await page.goto('/examples/operations/#run/r41');
  await expect(page.getByText(/Installed zod@3 and ran the tests/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Allow once/ })).toHaveCount(0);

  // Typing in the run gets an honest answer from the sample agent.
  await page.getByRole('textbox').fill('Also bump the timeout');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/sample agent, so it cannot act/)).toBeVisible();
  expect(problems).toEqual([]);
});

test('the assistant streams answers, starts new chats, and says plainly what it cannot do', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/examples/assistant/');
  await page.getByRole('button', { name: 'Summarise this week’s runs' }).click();
  await expect(page.getByText(/46 runs this week/)).toBeVisible();
  // The first message names the new chat in the sidebar.
  await expect(page.getByRole('navigation', { name: 'Chats' }).getByRole('link', { name: 'Summarise this week’s runs' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('textbox').fill('What is the capital of France?');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/sample assistant with a few fixed answers/)).toBeVisible();
  expect(problems).toEqual([]);
});

test('the code review merges only once every change is accepted', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/examples/review/');
  const merge = page.getByRole('button', { name: 'Approve and merge' });
  await expect(merge).toBeDisabled();
  for (const file of await page.locator('.ex-file').all()) {
    await file.getByRole('button', { name: 'Accept all' }).click();
    await file.getByRole('button', { name: /Apply/ }).click();
  }
  await merge.click();
  await expect(page.getByText('Merged', { exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test('sign in checks the form, then setup walks through four steps', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/examples/sign-in/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter your work email.')).toBeVisible();
  await page.getByLabel('Work email').fill('you@acme.example');
  await page.getByLabel('Password').fill('a sample password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name: /Which repository/ })).toBeVisible();
  await page.getByText('acme/api', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ready to start' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'acme/api' })).toBeVisible();
  expect(problems).toEqual([]);
});

test('on the phones, answering a request takes it off that phone only', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/examples/mobile/');
  const second = page.getByRole('figure', { name: 'A request, as a sheet' });
  await second.getByRole('button', { name: /Allow once/ }).click();
  await expect(second.getByRole('button', { name: /Needs you 2/ })).toBeVisible();
  await expect(page.getByRole('figure', { name: 'What needs you' }).getByRole('button', { name: /Needs you 3/ })).toBeVisible();
  expect(problems).toEqual([]);
});
