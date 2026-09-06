import { defineConfig, devices } from '@playwright/test';

const reuseExistingServer = !process.env.CI;
const appCommand = process.env.CI
  ? 'node e2e/serve-built-app.mjs'
  : 'npm start -- --host 127.0.0.1 --port 4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: [
    {
      command: 'npm run start:api -- --host 0.0.0.0',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: appCommand,
      url: 'http://127.0.0.1:4200',
      reuseExistingServer,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
