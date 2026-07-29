import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://sasi-store-bs1x7zbor-brunomelo-8765s-projects.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: undefined,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
