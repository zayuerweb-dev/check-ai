import { test, expect } from '@playwright/test';
import { ready } from './helpers.mjs';

test.describe('home search routing', () => {
  test('SPA prefills search from ?q= and shows results', async ({ page }) => {
    await page.goto('/?q=gpt-5.5');
    await page.waitForSelector('#platformList .platform-card');
    await expect(page.locator('#platformSearch')).toHaveValue('gpt-5.5');
    await expect(page.locator('#platformList .platform-card strong').first()).toHaveText('OpenAI');
  });

  test('/zh/ stub redirects to / (client-side meta-refresh)', async ({ page }) => {
    // The static test server does not process _redirects, but zh/index.html
    // has a <meta http-equiv="refresh"> + JS redirect to /.
    await page.goto('/zh/');
    // After the client-side redirect, we should land at / with the SPA.
    await page.waitForURL('/');
    await page.waitForSelector('#platformList');
  });
});
