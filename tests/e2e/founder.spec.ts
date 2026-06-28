import { expect, test } from '@playwright/test'

import { loginAsPrimaryFounder, requireRunState } from './lib/auth'
import { e2eFounderName, e2eStartupName } from './lib/constants'
import { ensureImageFixtures } from './lib/fixtures'
import {
  findStartupByName,
  getBootstrapPayload,
} from './lib/payload-bootstrap'
import { appendCreatedId } from './lib/run-state'

test.describe.configure({ mode: 'serial' })

test.describe('founder account flows', () => {
  let fixturePaths: Awaited<ReturnType<typeof ensureImageFixtures>>

  test.beforeAll(async () => {
    requireRunState()
    fixturePaths = await ensureImageFixtures()
  })

  test('logs in and loads account overview', async ({ page }) => {
    const state = requireRunState()
    await loginAsPrimaryFounder(page)
    await expect(page.getByRole('heading', { name: new RegExp(state.token) })).toBeVisible()
  })

  test('edits profile and persists changes', async ({ page }) => {
    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()
    await page.waitForURL(/\/account\/profile/)

    const headline = `E2E headline ${Date.now()}`
    const bio = `E2E bio ${Date.now()}`
    const linkedIn = 'https://linkedin.com/in/e2e-test-founder'

    await page.locator('#headline').fill(headline)
    await page.locator('#bio').fill(bio)
    await page.locator('#linkedIn').fill(linkedIn)
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.locator('#headline')).toHaveValue(headline)
    await expect(page.locator('#bio')).toHaveValue(bio)
    await expect(page.locator('#linkedIn')).toHaveValue(linkedIn)
  })

  test('uploads small and large avatars with progress UI', async ({ page }) => {
    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()

    for (const avatarPath of [fixturePaths.smallAvatar, fixturePaths.largeAvatar]) {
      await page.locator('#avatar').setInputFiles(avatarPath)
      await page.getByRole('button', { name: 'Save profile' }).click()
      await expect(page.getByRole('progressbar')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Saved')).toBeVisible({ timeout: 60_000 })
      await expect(page.locator('img[src^="blob:"]')).toBeVisible()
    }
  })

  test('creates a startup with team members', async ({ page }) => {
    const state = requireRunState()
    const startupName = e2eStartupName(state.token, 'Startup')
    const secondaryName = e2eFounderName(state.token, 'Founder2')

    await loginAsPrimaryFounder(page)
    await page.goto('/account/startups/new')

    await page.locator('#logo').setInputFiles(fixturePaths.logo)
    await page.locator('#name').fill(startupName)
    await page.locator('#tagline').fill('E2E startup tagline')
    await page.locator('#description').fill('E2E startup description for Playwright.')
    await page.locator('#industry').selectOption({ index: 1 })
    await page.locator('#stage').selectOption('mvp')
    await page.locator('#teamSize').fill('5')

    await page.getByRole('button', { name: 'Add team member' }).click()
    await page.locator('#team-member-1').fill(secondaryName.slice(0, 12))
    await page.waitForTimeout(400)
    await page.getByRole('option').filter({ hasText: secondaryName }).first().click()

    await page.getByRole('button', { name: 'Add team member' }).click()
    await page.locator('#team-member-2').fill('E2E Unlinked Member')
    await page.keyboard.press('Tab')

    await expect(page.locator('#team-member-0')).toHaveValue(new RegExp('E2E__'))
    await expect(page.getByLabel('Primary contact').first()).toBeChecked()

    await page.getByRole('button', { name: 'Create startup' }).click()
    await expect(page.getByText(/pending review/i)).toBeVisible({ timeout: 60_000 })
    await page.goto('/account/startups')
    await expect(page.getByText(startupName)).toBeVisible()

    const payload = await getBootstrapPayload()
    const startup = await findStartupByName(payload, startupName)
    expect(startup).not.toBeNull()
    appendCreatedId('startups', startup!.id)
  })

  test('submits a claim for the claimable startup', async ({ page }) => {
    const state = requireRunState()

    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My startups' }).click()
    await page.getByRole('button', { name: 'Add your startup' }).click()
    await expect(page.getByRole('dialog', { name: 'Add your startup' })).toBeVisible()

    await page.locator('#startup-search').fill('E2E__Claimable')
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Claim' }).click()
    await expect(page.getByText(/claim submitted/i)).toBeVisible({ timeout: 15_000 })

    await page.goto('/account/claims')
    await expect(page.getByText(e2eStartupName(state.token, 'Claimable'))).toBeVisible()
    await expect(page.getByText('Claim under review')).toBeVisible()
  })

  test('rejects founder access to admin', async ({ page }) => {
    await loginAsPrimaryFounder(page)
    await page.goto('/admin')
    await expect(
      page.getByRole('heading', { name: /unauthorized.*admin panel/i }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/not allowed to access this page/i)).toBeVisible()
    await expect(page).not.toHaveURL(/\/admin\/collections/)
  })
})
