import { test, expect } from '@playwright/test';

test.describe('portal panels', () => {
  test('company chip routes to /app/?q=', async ({ page }) => {
    await page.goto('/');
    const chip = page.locator('.company-chip', { hasText: 'OpenAI' }).first();
    await expect(chip).toHaveAttribute('href', '/app/?q=OpenAI');
  });

  test('tool nav link points to /app/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.seo-header nav a', { hasText: '对比工具' })).toHaveAttribute('href', '/app/');
  });
});
