import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('model search', () => {
  test('typing a model name shows a 模型 results group', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt-5.5');
    await expect(page.locator('#modelResults .model-result').first()).toBeVisible();
  });

  test('clicking a model result opens the detail modal with a 查看完整页 link', async ({ page }) => {
    await ready(page);
    await page.fill('#platformSearch', 'gpt-5.5');
    await page.locator('#modelResults .model-result').first().click();
    await expect(page.locator('#modelDetailModal')).toHaveClass(/open/);
    const link = page.locator('#modelDetailContent a.detail-fullpage');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/models\/[a-z0-9-]+\/$/);
    const resp = await page.request.get(href);
    expect(resp.status()).toBe(200);
  });
});
