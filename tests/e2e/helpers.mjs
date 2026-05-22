// Shared setup: load the SPA and wait until the live data snapshot is merged in
// (an aggregator like a Gateway/OpenRouter only exists after loadLive() runs,
// so waiting for one guarantees the full model set is present, not just seed).
export async function ready(page, lang = 'zh') {
  await page.goto(`/?lang=${lang}`);
  await page.waitForSelector('#platformList .platform-card');
  await page.waitForFunction(
    () => [...document.querySelectorAll('#platformList .platform-card strong')]
      .some((s) => /gateway|openrouter/i.test(s.textContent || '')),
    null,
    { timeout: 15_000 },
  );
}

export const firstPlatform = (page) => page.locator('#platformList .platform-card strong').first();
