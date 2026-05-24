import { test, expect } from '@playwright/test';

test.describe('home view', () => {
  test('/ lands on the home view, no company auto-selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('[data-i18n="homeLatest"]')).toBeVisible();
    await expect(page.locator('[data-i18n="homePopular"]')).toBeVisible();
    await expect(page.locator('.platform-summary')).toBeHidden();
    await expect(page.locator('#homeButton')).toHaveClass(/active/);
  });

  test('selecting a company shows detail and hides home', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#platformList .platform-card');
    await page.locator('#platformList .platform-card').first().click();
    await expect(page.locator('#home')).toBeHidden();
    await expect(page.locator('.platform-summary')).toBeVisible();
  });

  test('主页 button returns to the home view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#platformList .platform-card');
    await page.locator('#platformList .platform-card').first().click();
    await expect(page.locator('#home')).toBeHidden();
    await page.locator('#homeButton').click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('.platform-summary')).toBeHidden();
  });

  test('home latest + popular cards link to real model pages', async ({ page }) => {
    await page.goto('/');
    const latest = await page.locator('#home .home-newsc').first().getAttribute('href');
    expect(latest).toMatch(/^\/models\/.+\/$/);
    expect((await page.goto(latest)).status()).toBe(200);
    await page.goto('/');
    const pop = await page.locator('#home .home-popi').first().getAttribute('href');
    expect(pop).toMatch(/^\/models\/.+\/$/);
    expect((await page.goto(pop)).status()).toBe(200);
  });
});
