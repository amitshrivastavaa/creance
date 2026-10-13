import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

// Components installed with `shadcn add` into a shadcn project (see scripts/registry-smoke.mjs).
const scheme = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);

test('installed components render, work and pass axe', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Read the build log')).toBeVisible();
  await expect(page.getByRole('heading', { name: /npm install zod@3/ })).toBeVisible();
  // The tokens loaded: Creance's variables are set on the page.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cr-color-text-default'))).not.toBe('');
  await expectNoAxeViolations(page);

  await page.getByRole('button', { name: /Allow once/ }).click();
  await expect(page.getByRole('status', { name: 'Decision' })).toHaveText('Allowed');
  await page.getByRole('textbox', { name: /Message/ }).fill('Go ahead');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Go ahead')).toBeVisible();
});

test('dark mode follows the app, through the .dark class or data-theme, not the system on its own', async ({ page }) => {
  // A shadcn app stays light on a dark system unless it sets .dark, so Creance does too.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await scheme(page)).toBe('light');
  await expectNoAxeViolations(page);

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  expect(await scheme(page)).toBe('dark');
  await expectNoAxeViolations(page);

  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'dark';
  });
  expect(await scheme(page)).toBe('dark');
});
