import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

// axe can't measure contrast through backdrop blur or background gradients (it reports them as
// incomplete), so scan with glass kept translucent but unblurred, on a solid page background.
const measurableGlass = `
  :root { --cr-glass-filter-window: none !important; --cr-glass-filter-sheet: none !important; --cr-gradient-canvas: none !important; --cr-gradient-horizon: none !important; }
  body, .cr-run-layout, .cr-sky { background: var(--cr-color-bg-canvas) !important; }
`;

export async function expectNoAxeViolations(page: Page) {
  // A scan during a fade-in measures half-transparent text and reports low contrast, so wait for
  // entry animations to end. Looping ones, like the spinner, never do and are left out.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)))
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  const style = await page.addStyleTag({ content: measurableGlass });
  const { violations } = await new AxeBuilder({ page }).analyze();
  await style.evaluate((el) => el.remove());
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}
