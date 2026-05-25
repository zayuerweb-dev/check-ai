import { test, expect } from '@playwright/test';

// Guards the bug where /zh/ was a redirect-to-home stub, so the "中文文章" link
// looped back to the tool. These tests FOLLOW the link and assert it lands on a
// real article list — "resolves to a file" is not enough.

test.describe('zh articles index', () => {
  test('/zh/ shows the Chinese article list, not a redirect to home', async ({ page }) => {
    await page.goto('/zh/');
    expect(page.url()).toMatch(/\/zh\/$/);
    await expect(page.locator('h1')).toContainText('中文');
    expect(await page.locator('a[href^="/zh/articles/"]').count()).toBeGreaterThan(0);
    // it is the static index, not the SPA tool
    await expect(page.locator('#platformList')).toHaveCount(0);
    // and it is not a redirect stub
    expect(await page.locator('meta[http-equiv="refresh"]').count()).toBe(0);
  });

  test('trust-bar 中文文章 link leads to the article list', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.trust-meta a', { hasText: '中文文章' });
    await expect(link).toHaveAttribute('href', '/zh/');
    await link.click();
    await page.waitForURL(/\/zh\/$/);
    expect(await page.locator('a[href^="/zh/articles/"]').count()).toBeGreaterThan(0);
  });

  test('home 深度文章 "全部" link points to /zh/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home a', { hasText: '全部' }).first()).toHaveAttribute('href', '/zh/');
  });
});
