import { defineConfig, devices } from '@playwright/test';

// Starts the production build on :3100 unless PROTOTYPE_URL points at a running server.
const url = process.env.PROTOTYPE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: url, viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: process.env.PROTOTYPE_URL ? undefined : {
    command: 'pnpm build && pnpm exec next start -p 3100',
    url,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
