import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

async function openCompare(page) {
  await page.click('#globalCompareButton');
  await expect(page.locator('#compareModal')).toHaveClass(/open/);
  await page.waitForSelector('#modelFilters .model-chip');
}

// Select the company with the fewest models so the wrapping flex container has
// leftover vertical space — the exact condition that used to balloon chips into
// giant ovals before align-content/align-items were pinned to flex-start.
async function selectSmallestCompany(page) {
  return page.evaluate(() => {
    const chips = [...document.querySelectorAll('#companyFilters .company-chip')];
    let best = null;
    let bestN = Infinity;
    for (const c of chips) {
      c.click();
      const n = document.querySelectorAll('#modelFilters .model-chip').length;
      if (n > 0 && n < bestN) { bestN = n; best = c; }
    }
    if (best) best.click();
    return bestN;
  });
}

test.describe('compare workspace', () => {
  test('model chips keep natural pill height with few models (no ballooning)', async ({ page }) => {
    await ready(page);
    await openCompare(page);
    await selectSmallestCompany(page);

    const measured = await page.evaluate(() => {
      const mf = document.getElementById('modelFilters');
      const cs = getComputedStyle(mf);
      const chips = [...document.querySelectorAll('#modelFilters .model-chip')];
      return {
        alignContent: cs.alignContent,
        alignItems: cs.alignItems,
        maxChipHeight: Math.max(...chips.map((c) => c.offsetHeight)),
      };
    });

    // Deterministic guard: the fix is exactly these two properties.
    expect(measured.alignContent).toBe('flex-start');
    expect(measured.alignItems).toBe('flex-start');
    // User-visible outcome: a pill is ~34px; ballooned ovals were ~48px+.
    expect(measured.maxChipHeight).toBeLessThan(44);
  });

  test('clicking a model adds it to the comparison table', async ({ page }) => {
    await ready(page);
    await openCompare(page);
    await page.locator('#modelFilters .model-chip').first().click();
    await expect(page.locator('#selectedModelList .selected-model-pill')).toHaveCount(1);
    await expect(page.locator('#compareRows .model-row')).toHaveCount(1);
  });

  test('"select all" picks every model in the company, "clear" empties it', async ({ page }) => {
    await ready(page);
    await openCompare(page);
    await page.click('#selectScopedModels');
    const picked = await page.locator('#selectedModelList .selected-model-pill').count();
    expect(picked).toBeGreaterThan(1);
    await page.click('#clearSelectedModels');
    await expect(page.locator('#selectedModelList .empty-note')).toBeVisible();
  });
});
