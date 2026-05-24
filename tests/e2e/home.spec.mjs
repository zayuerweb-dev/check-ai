import { test, expect } from '@playwright/test';

test.describe('home portal', () => {
  test('portal hero search routes to /app/ with the query', async ({ page }) => {
    await page.goto('/');
    await page.fill('.home-search input[name="q"]', 'claude');
    await page.locator('.home-search button[type="submit"]').click();
    await page.waitForURL(/\/app\/\?q=claude/);
    await page.waitForSelector('#platformList .platform-card');
    await expect(
      page.locator('#platformList .platform-card strong', { hasText: 'Anthropic' }).first(),
    ).toBeVisible();
  });

  test('old /?q= deep link client-redirects to /app/', async ({ page }) => {
    await page.goto('/?q=gpt-5.5');
    await page.waitForURL(/\/app\/\?q=gpt-5\.5/);
    await expect(page.locator('#platformSearch')).toHaveValue('gpt-5.5');
  });

  test('portal shows latest + popular sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2', { hasText: '最新模型' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '热门模型' })).toBeVisible();
  });
});
