import { expect, test } from '@playwright/test'

import { requireRunState } from './lib/auth'
import { e2eFounderName, e2eOrgName, e2eOrgSlug, e2eProgramName, e2eStartupName } from './lib/constants'
import { requireE2eProdGuard } from './lib/guards'
import { getBootstrapPayload } from './lib/payload-bootstrap'

test.describe.configure({ mode: 'serial' })

test.describe('organization public pages', () => {
  test.beforeAll(() => {
    requireE2eProdGuard()
    requireRunState()
  })

  test('lists linked founders and startups on published org profile', async ({ page }) => {
    const state = requireRunState()
    const orgSlug = e2eOrgSlug(state.token)
    const founderName = e2eFounderName(state.token, 'Founder')
    const startupName = e2eStartupName(state.token, 'OrgLinked')

    await page.goto(`/organizations/${orgSlug}`)
    await expect(page.getByRole('heading', { name: e2eOrgName(state.token) })).toBeVisible()
    await expect(page.getByRole('link', { name: founderName })).toBeVisible()
    await expect(page.getByRole('link', { name: startupName })).toBeVisible()
  })

  test('lists upcoming programs and excludes past programs on org profile', async ({ page }) => {
    const state = requireRunState()
    const orgSlug = e2eOrgSlug(state.token)
    const upcomingName = e2eProgramName(state.token, 'Upcoming')
    const pastName = e2eProgramName(state.token, 'Past')

    await page.goto(`/organizations/${orgSlug}`)
    await expect(page.getByRole('heading', { name: 'Cohorts & Programs' })).toBeVisible()
    await expect(page.getByText(upcomingName)).toBeVisible()
    await expect(page.getByText(pastName)).not.toBeVisible()
  })

  test('returns 404 for draft organization', async ({ page }) => {
    const state = requireRunState()
    const draftSlug = e2eOrgSlug(state.token, 'draft')

    const response = await page.goto(`/organizations/${draftSlug}`)
    expect(response?.status()).toBe(404)
  })

  test('shows grouped backed-by on founder profile', async ({ page }) => {
    const state = requireRunState()
    const payload = await getBootstrapPayload()
    const founder = await payload.findByID({
      collection: 'founders',
      id: state.founders.primary,
      overrideAccess: true,
    })

    await page.goto(`/founders/${founder.slug}`)
    await expect(page.getByRole('heading', { name: 'Incubated at', exact: true })).toBeVisible()
    await expect(
      page.getByRole('link', { name: e2eOrgName(state.token) }),
    ).toHaveAttribute('href', `/organizations/${e2eOrgSlug(state.token)}`)
  })
})
