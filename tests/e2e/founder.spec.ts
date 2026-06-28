import { expect, test } from '@playwright/test'

import { loginAsPrimaryFounder, requireRunState } from './lib/auth'
import { e2eFounderName, e2eOrgName, e2eStartupName } from './lib/constants'
import { requireE2eProdGuard } from './lib/guards'
import { ensureImageFixtures } from './lib/fixtures'
import {
  findStartupByName,
  getBootstrapPayload,
} from './lib/payload-bootstrap'
import { appendCreatedId } from './lib/run-state'

/** Must match gender option values in src/collections/Founders.ts */
const PUBLIC_GENDER_ENUM_VALUES = [
  'female',
  'male',
  'non-binary',
  'prefer-not-to-say',
  'other',
] as const

function assertGenderNotLeakedInHtml(html: string) {
  for (const value of PUBLIC_GENDER_ENUM_VALUES) {
    expect(html).not.toContain(`"gender":"${value}"`)
    expect(html).not.toContain(`\\"gender\\":\\"${value}\\"`)
  }
}

test.describe.configure({ mode: 'serial' })

test.describe('founder account flows', () => {
  let fixturePaths: Awaited<ReturnType<typeof ensureImageFixtures>>

  test.beforeAll(async () => {
    requireE2eProdGuard()
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

  test('sets location, cohort, and preserves location on untouched save', async ({ page }) => {
    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()
    await page.waitForURL(/\/account\/profile/)

    await page.locator('#location-state').click()
    await page.getByPlaceholder('Search states…').fill('Karnataka')
    await page.getByText('Karnataka', { exact: true }).click()

    await page.locator('#location-city').click()
    await page.getByPlaceholder('Search cities…').fill('Bangalore Urban')
    await page.getByRole('option', { name: 'Bangalore Urban' }).click()

    await page.locator('#cohortName').fill('E2E Cohort')
    await page.locator('#cohortYear').selectOption(String(new Date().getFullYear()))

    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.locator('input[name="state"]')).toHaveValue('Karnataka')
    await expect(page.locator('input[name="city"]')).toHaveValue('Bangalore Urban')
    await expect(page.locator('#cohortName')).toHaveValue('E2E Cohort')

    const stateBefore = await page.locator('input[name="state"]').inputValue()
    const cityBefore = await page.locator('input[name="city"]').inputValue()
    const countryBefore = await page.locator('input[name="country"]').inputValue()

    const headline = `E2E headline only ${Date.now()}`
    await page.locator('#headline').fill(headline)
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.locator('#headline')).toHaveValue(headline)
    await expect(page.locator('input[name="state"]')).toHaveValue(stateBefore)
    await expect(page.locator('input[name="city"]')).toHaveValue(cityBefore)
    await expect(page.locator('input[name="country"]')).toHaveValue(countryBefore)
  })

  test('filters founders directory by saved state', async ({ page }) => {
    const state = requireRunState()
    const payload = await getBootstrapPayload()

    await payload.update({
      collection: 'founders',
      id: state.founders.primary,
      data: {
        moderationStatus: 'approved',
        verificationStatus: 'verified',
      },
      overrideAccess: true,
    })

    await page.goto('/founders?state=Karnataka')
    await expect(page.getByRole('heading', { name: new RegExp(state.token) })).toBeVisible()
  })

  test('women founder filter, badge, city alias, and gender privacy', async ({ page }) => {
    const state = requireRunState()
    const payload = await getBootstrapPayload()

    await payload.update({
      collection: 'founders',
      id: state.founders.primary,
      data: {
        gender: 'female',
        moderationStatus: 'approved',
        verificationStatus: 'verified',
      },
      overrideAccess: true,
    })

    const founderDoc = await payload.findByID({
      collection: 'founders',
      id: state.founders.primary,
      overrideAccess: true,
    })

    await page.goto('/founders?women=1&state=Karnataka')
    await expect(page.getByRole('heading', { name: new RegExp(state.token) })).toBeVisible()
    assertGenderNotLeakedInHtml(await page.content())

    await page.goto('/founders?women=1&state=Tamil Nadu')
    await expect(page.getByRole('heading', { name: new RegExp(state.token) })).not.toBeVisible()

    await page.goto(`/founders/${founderDoc.slug}`)
    await expect(page.getByText('Women founder')).toBeVisible()
    await expect(page.getByText(/Bengaluru/)).toBeVisible()
    await expect(page.getByText('Bangalore Urban')).not.toBeVisible()
    assertGenderNotLeakedInHtml(await page.content())

    await page.goto('/founders?state=Karnataka')
    await expect(page.locator('#city option[value="Bangalore Urban"]')).toHaveText('Bengaluru')

    await page.goto('/founders?state=Karnataka&city=Bangalore+Urban&women=1')
    await expect(page.getByRole('heading', { name: new RegExp(state.token) })).toBeVisible()
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

    await page.getByRole('button', { name: 'Add opportunity' }).click()
    await page.locator('#opportunity-title-0').fill('E2E Engineer')
    await page.locator('#opportunity-link-0').fill('https://example.com/apply')

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

  test('pre-fills organization picker and preserves orgs on untouched save', async ({ page }) => {
    const state = requireRunState()
    const orgChipLabel = `${e2eOrgName(state.token)} · Incubator`

    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()
    await page.waitForURL(/\/account\/profile/)

    await expect(page.getByText(orgChipLabel)).toBeVisible()

    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.getByText(orgChipLabel)).toBeVisible()
  })

  test('rejects invalid organization IDs on save', async ({ page }) => {
    const state = requireRunState()
    const orgChipLabel = `${e2eOrgName(state.token)} · Incubator`

    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()
    await page.waitForURL(/\/account\/profile/)
    await expect(page.getByText(orgChipLabel)).toBeVisible()

    await page.locator('form:has(#name)').evaluate((form) => {
      const orgInputs = form.querySelectorAll<HTMLInputElement>('input[name="organizations"]')
      if (orgInputs.length === 0) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'organizations'
        input.value = '999999'
        form.appendChild(input)
      } else {
        orgInputs.forEach((input) => {
          input.value = '999999'
        })
      }

      let touched = form.querySelector<HTMLInputElement>('input[name="organizationsTouched"]')
      if (!touched) {
        touched = document.createElement('input')
        touched.type = 'hidden'
        touched.name = 'organizationsTouched'
        form.appendChild(touched)
      }
      touched.value = '1'
    })

    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(
      page.getByText(/One or more selected organizations are invalid/i),
    ).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.getByText(orgChipLabel)).toBeVisible()
  })

  test('clears organizations when all chips are removed', async ({ page }) => {
    const state = requireRunState()
    const orgName = e2eOrgName(state.token)
    const orgChipLabel = `${orgName} · Incubator`

    await loginAsPrimaryFounder(page)
    await page.getByRole('link', { name: 'My profile' }).click()
    await page.waitForURL(/\/account\/profile/)
    await expect(page.getByText(orgChipLabel)).toBeVisible()

    await page.getByRole('button', { name: `Remove ${orgName}` }).click()
    await expect(page.getByText(orgChipLabel)).not.toBeVisible()

    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 30_000 })

    await page.reload()
    await expect(page.getByText(orgChipLabel)).not.toBeVisible()
  })
})
