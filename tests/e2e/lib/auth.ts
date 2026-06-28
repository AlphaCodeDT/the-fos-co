import type { Page } from '@playwright/test'

import { e2eFounderEmail } from './constants'
import { readRunState } from './run-state'

export function requireRunState() {
  const state = readRunState()
  if (!state) {
    throw new Error('E2E run state not found. Did global-setup run?')
  }
  return state
}

export async function loginAsPrimaryFounder(page: Page): Promise<void> {
  const state = requireRunState()

  await page.goto('/login')
  await page.getByLabel('Email').fill(e2eFounderEmail(state.token, 'founder'))
  await page.getByLabel('Password').fill(state.founderPassword)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(/\/account/, { timeout: 30_000 })
}

export async function loginAsPrimaryFounderInNewContext(page: Page): Promise<void> {
  await loginAsPrimaryFounder(page)
}
