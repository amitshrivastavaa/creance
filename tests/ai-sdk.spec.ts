import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

// The AI SDK example: useChat drives the agent, the adapter turns its messages into a Creance run.
test('the agent asks before installing, shows its edit as a diff, and hands back when the checks pass', async ({ page }) => {
  await page.goto('/');
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: 'Start the agent' }).click();

  // install_package waits for a person.
  await expect(page.getByRole('heading', { name: /npm install zod@\^3\.23\.8/ })).toBeVisible();
  await expect(page.getByText('Waiting for you').first()).toBeVisible();
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: /Allow once/ }).click();

  // write_file is reviewed as a diff; applying it approves the write.
  await expect(page.getByRole('button', { name: 'Accept all' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept all' }).click();
  await page.getByRole('button', { name: /^Apply/ }).click();

  await expect(page.getByRole('heading', { name: 'Claude finished and handed back to you' })).toBeVisible();
  await expect(page.getByText('raised deploy retries from 1 to 3').first()).toBeVisible();
  await expect(page.getByText('Completed').first()).toBeVisible();
  await expectNoAxeViolations(page);
});

test('denying the install is passed back to the agent, which carries on without it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start the agent' }).click();
  await page.getByRole('button', { name: /Deny/ }).click();
  // The agent carries on to the config edit; the denied call stays in the timeline, failed.
  await expect(page.getByRole('button', { name: 'Accept all' })).toBeVisible();
  await expect(page.getByRole('button', { name: /install_package Failed/ })).toBeVisible();
  await expect(page.getByText('Denied by you', { exact: true })).toBeVisible();
});

test('the kill switch stops the run', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start the agent' }).click();
  await expect(page.getByRole('button', { name: /Allow once/ })).toBeVisible();
  const stop = page.getByRole('button', { name: /Hold to stop/ });
  await stop.hover();
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  await expect(page.getByText('You stopped the agent. Nothing more will run.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Allow once/ })).toHaveCount(0);
});

test('the start page and a waiting run pass axe in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: 'Start the agent' }).click();
  await expect(page.getByRole('button', { name: /Allow once/ })).toBeVisible();
  await expectNoAxeViolations(page);
});
