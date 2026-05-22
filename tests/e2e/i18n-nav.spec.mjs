import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('language switch', () => {
  test('switching the language selector updates UI copy', async ({ page }) => {
    await ready(page, 'zh');
    const searchLabel = page.locator('[data-i18n="search"]');
    await expect(searchLabel).toHaveText('搜索');
    await page.selectOption('#languageSelect', 'en');
    await expect(searchLabel).toHaveText('Search');
    await page.selectOption('#languageSelect', 'ja');
    await expect(searchLabel).toHaveText('検索');
  });

  test('?lang=en loads the app in English', async ({ page }) => {
    await ready(page, 'en');
    await expect(page.locator('[data-i18n="search"]')).toHaveText('Search');
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('list → detail opens the workspace, back returns to the list', async ({ page }) => {
    await ready(page, 'zh');
    await page.locator('#platformList .platform-card').first().click();
    await expect(page.locator('body')).toHaveClass(/mobile-workspace-open/);

    await page.click('#mobileBackBtn');
    await expect(page.locator('body')).not.toHaveClass(/mobile-workspace-open/);
  });

  test('compare overlay opens and closes', async ({ page }) => {
    await ready(page, 'zh');
    await page.click('#globalCompareButton');
    await expect(page.locator('#compareModal')).toHaveClass(/open/);
    await page.click('#closeCompareButton');
    await expect(page.locator('#compareModal')).not.toHaveClass(/open/);
  });
});
