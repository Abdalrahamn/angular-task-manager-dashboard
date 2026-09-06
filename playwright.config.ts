import { defineConfig, devices } from '@playwright/test';

const reuseExistingServer = !process.env.CI;
const apiCommand = process.env.CI ? 'npm run start:api:e2e' : 'npm run start:api -- --host 0.0.0.0';
const appCommand = process.env.CI
  ? 'node e2e/serve-built-app.mjs'
  : 'npm start -- --host 127.0.0.1 --port 4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
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
      name: 'api',
      command: apiCommand,
      // json-server serves ./public, so GET / and /index.html are 404.
      url: 'http://127.0.0.1:3000/tasks',
      reuseExistingServer,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      name: 'app',
      command: appCommand,
      url: 'http://127.0.0.1:4200/index.html',
      reuseExistingServer,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
