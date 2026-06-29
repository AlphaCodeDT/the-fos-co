import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

const root = process.cwd()

dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

const e2eRunToken = process.env.E2E_RUN_TOKEN || `e2e_${Date.now()}`
process.env.E2E_RUN_TOKEN = e2eRunToken

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  forbidOnly: Boolean(process.env.CI),
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'organizations',
      testMatch: 'organizations.spec.ts',
    },
    {
      name: 'programs',
      testMatch: 'programs.spec.ts',
      dependencies: ['organizations'],
    },
    {
      name: 'founder',
      testMatch: 'founder.spec.ts',
      dependencies: ['programs'],
    },
    {
      name: 'admin',
      testMatch: 'admin.spec.ts',
      dependencies: ['founder'],
    },
    {
      name: 'mobile',
      testMatch: 'mobile.spec.ts',
      dependencies: ['admin'],
      use: {
        viewport: { width: 390, height: 844 },
      },
    },
  ],
})
