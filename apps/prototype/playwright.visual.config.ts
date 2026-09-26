import { defineConfig, devices } from '@playwright/test';

// Screenshot comparison with designs/*/screenshots (pnpm visual). Separate from the e2e suite: it never
// fails on pixel differences, it writes visual-results/ for review and a summary for docs/prototype-plan.md.
const url = process.env.PROTOTYPE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './visual',
  outputDir: './test-results/visual',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: url },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 } }],
  webServer: process.env.PROTOTYPE_URL ? undefined : {
    command: 'pnpm build && pnpm exec next start -p 3100',
    url,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
