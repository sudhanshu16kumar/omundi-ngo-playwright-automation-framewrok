import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { TEST_DATA } from './config/test-data';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: 0,
  timeout: 15 * 60 * 1000,

  expect: {
    timeout: 30_000
  },

  reporter: [
    ['list'],
    ['./helpers/google-sheet-bug.reporter.ts'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    baseURL:
      process.env.BASE_URL ??
      'https://omundi-ngo-web.wartinlabstesting.dev',

    headless: process.env.HEADLESS === 'true',

    viewport: {
      width: TEST_DATA.browser.width,
      height: TEST_DATA.browser.height
    },

    actionTimeout: 20_000,
    navigationTimeout: 60_000,

    launchOptions: {
      args: [
        `--window-size=${TEST_DATA.browser.width + 20},${TEST_DATA.browser.height + 80}`,
        '--disable-pinch'
      ]
    },

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: TEST_DATA.browser.width,
          height: TEST_DATA.browser.height
        },
        deviceScaleFactor: 1
      }
    }
  ],

  outputDir: 'test-results'
});
