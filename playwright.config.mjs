import { defineConfig, devices } from '@playwright/test';

// E2E config for the Check.AI SPA. A zero-dep static server serves the repo so
// the app fetches the committed /data/models-dev.json snapshot (deterministic —
// no live models.dev call during tests).
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8799',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node scripts/static-server.mjs 8799',
    port: 8799,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
