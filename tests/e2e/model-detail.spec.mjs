import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('model detail', () => {
  test('opening a model row shows the detail dialog with a radar chart', async ({ page }) => {
    await ready(page);
    // Since the SPA now starts in home view, click a company card first to enter detail view.
    await page.locator('#platformList .platform-card').first().click();
    await page.click('.tab[data-tab="models"]');
    await page.waitForSelector('#modelRows .model-row');
    await page.locator('#modelRows .model-row').first().click();

    await expect(page.locator('#modelDetailModal')).toHaveClass(/open/);
    await expect(page.locator('#modelDetailTitle')).not.toBeEmpty();
    await expect(page.locator('#modelDetailContent .radar-svg')).toBeVisible();

    await page.click('#closeModelDetailButton');
    await expect(page.locator('#modelDetailModal')).not.toHaveClass(/open/);
  });
});

test.describe('share', () => {
  test('compare modal exposes a copy-link button (share.js)', async ({ page }) => {
    await ready(page);
    await page.click('#globalCompareButton');
    await expect(page.locator('.share-compare-btn')).toBeVisible();
  });

  test('?compare= deep-link pre-selects models', async ({ page }) => {
    await ready(page);
    // Grab a real model key from the compare picker, then deep-link to it.
    await page.click('#globalCompareButton');
    await page.waitForSelector('#modelFilters .model-chip');
    const key = await page.locator('#modelFilters .model-chip').first().getAttribute('data-key');
    await page.goto(`/?lang=zh&compare=${encodeURIComponent(key)}`);
    await expect(page.locator('#selectedModelList .selected-model-pill')).toHaveCount(1, { timeout: 10_000 });
  });
});
