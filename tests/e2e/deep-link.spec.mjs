import { test, expect } from '@playwright/test';

// /?q=<name> deep links. Regression guard: this used to only fill the search
// box and then force home view, so /?q=OpenAI showed the home dashboard instead
// of OpenAI. Now an exact platform-name match jumps straight to its detail.
test.describe('?q= deep link', () => {
  test('?q=<platform> opens that platform detail directly', async ({ page }) => {
    await page.goto('/?lang=zh&q=OpenAI');
    await page.waitForSelector('#platformList .platform-card');
    await expect(page.locator('body')).not.toHaveClass(/home-view/);
    await expect(page.locator('#platformTitle')).toHaveText('OpenAI');
  });

  test('?q=<non-platform> falls back to home with the search box pre-filled', async ({ page }) => {
    await page.goto('/?lang=zh&q=zzznotaplatform');
    await page.waitForSelector('#platformList');
    await expect(page.locator('body')).toHaveClass(/home-view/);
    await expect(page.locator('#platformSearch')).toHaveValue('zzznotaplatform');
  });
});
