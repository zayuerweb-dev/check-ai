import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('home search routing', () => {
  test('SPA prefills search from ?q= and shows results', async ({ page }) => {
    await page.goto('/?q=gpt-5.5');
    await page.waitForSelector('#platformList .platform-card');
    await expect(page.locator('#platformSearch')).toHaveValue('gpt-5.5');
    await expect(page.locator('#platformList .platform-card strong').first()).toHaveText('OpenAI');
  });

  test('zh hub search form routes to the SPA with the query', async ({ page }) => {
    await page.goto('/zh/');
    await page.fill('.home-search input[name="q"]', 'claude');
    await page.locator('.home-search button[type="submit"]').click();
    await page.waitForURL(/\/\?q=claude/);
    await page.waitForSelector('#platformList .platform-card');
    await expect(
      page.locator('#platformList .platform-card strong', { hasText: 'Anthropic Claude' }).first(),
    ).toBeVisible();
  });

  test('zh hub shows a latest-models section', async ({ page }) => {
    await page.goto('/zh/');
    await expect(page.locator('h2', { hasText: '最新模型' })).toBeVisible();
  });
});
