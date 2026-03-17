import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ParaBank test automation suite.
 * Supports two separate projects: UI (browser-based) and API (REST).
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : '50%',
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: 'https://parabank.parasoft.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'ui',
      testMatch: ['**/tests/ui/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'api',
      testMatch: ['**/tests/api/**/*.spec.ts'],
      // API tests use the ParaBankApiClient directly which has its own BASE URL
    },
  ],
});
