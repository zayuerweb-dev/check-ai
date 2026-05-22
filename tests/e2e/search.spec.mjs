import { test, expect } from '@playwright/test';
import { ready, firstPlatform } from './helpers.mjs';

// Regression target: searching "gpt 5.5" used to surface an aggregator (Vercel)
// and drop OpenAI, because provider listings disagree on separators. The fix
// normalizes [\s\-_] in both query and corpus.
test.describe('platform search', () => {
  test('space query "gpt 5.5" ranks OpenAI first', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt 5.5');
    await expect(firstPlatform(page)).toHaveText('OpenAI');
  });

  test('hyphen query "gpt-5.5" ranks OpenAI first', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt-5.5');
    await expect(firstPlatform(page)).toHaveText('OpenAI');
  });

  test('no-separator "gpt5.5" still matches OpenAI', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt5.5');
    await expect(firstPlatform(page)).toHaveText('OpenAI');
  });

  test('"claude" finds Anthropic Claude', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'claude');
    await expect(
      page.locator('#platformList .platform-card strong', { hasText: 'Anthropic Claude' }).first(),
    ).toBeVisible();
  });

  test('open-source filter narrows the list, then clears back', async ({ page }) => {
    await ready(page);
    const before = await page.locator('#platformList .platform-card').count();
    await page.click('.filter-chip[data-filter="open"]');
    const after = await page.locator('#platformList .platform-card').count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    await page.click('.filter-chip[data-filter=""]');
    await expect(page.locator('#platformList .platform-card')).toHaveCount(before);
  });

  test('a nonsense query shows the empty state', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'zzzzznotathing');
    await expect(page.locator('#platformList .empty-results')).toBeVisible();
  });
});
