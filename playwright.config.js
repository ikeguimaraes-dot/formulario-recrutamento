import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests', workers: 1,
  use: { baseURL: process.env.FORM_BASE_URL || 'http://127.0.0.1:4198', channel: 'chrome', headless: true },
  webServer: process.env.FORM_BASE_URL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4198',
    url: 'http://127.0.0.1:4198', reuseExistingServer: false,
  },
})
