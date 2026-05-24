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

test.describe('portal injected cards', () => {
  test('a latest card links to a real model page', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.seo-card', { hasText: '最新模型' })
      .locator('a.section-link').first().getAttribute('href');
    expect(href).toMatch(/^\/models\/.+\/$/);
    const resp = await page.goto(href);
    expect(resp.status()).toBe(200);
  });

  test('a popular card links to a real model page', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.portal-card').first().getAttribute('href');
    expect(href).toMatch(/^\/models\/.+\/$/);
    const resp = await page.goto(href);
    expect(resp.status()).toBe(200);
  });
});
