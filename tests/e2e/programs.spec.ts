import { expect, test } from '@playwright/test'

import { requireRunState } from './lib/auth'
import { e2eOrgName, e2eProgramName, e2eProgramSlug } from './lib/constants'
import { requireE2eProdGuard } from './lib/guards'

test.describe.configure({ mode: 'serial' })

test.describe('programs public pages', () => {
  test.beforeAll(() => {
    requireE2eProdGuard()
    requireRunState()
  })

  test('lists upcoming programs on global directory', async ({ page }) => {
    const state = requireRunState()
    const upcomingName = e2eProgramName(state.token, 'Upcoming')
    const pastName = e2eProgramName(state.token, 'Past')

    await page.goto('/programs')
    await expect(page.getByRole('heading', { name: 'Programs', exact: true })).toBeVisible()
    await expect(page.getByText(upcomingName)).toBeVisible()
    await expect(page.getByText(e2eOrgName(state.token))).toBeVisible()
    await expect(page.getByText(pastName)).not.toBeVisible()
  })

  test('renders program detail with org link and Apply button', async ({ page }) => {
    const state = requireRunState()
    const slug = e2eProgramSlug(state.token, 'upcoming')
    const upcomingName = e2eProgramName(state.token, 'Upcoming')

    await page.goto(`/programs/${slug}`)
    await expect(page.getByRole('heading', { name: upcomingName })).toBeVisible()
    await expect(page.getByRole('link', { name: e2eOrgName(state.token) })).toBeVisible()

    const applyLink = page.getByRole('link', { name: 'Apply' })
    await expect(applyLink).toBeVisible()
    await expect(applyLink).toHaveAttribute('href', 'https://example.com/apply-program')
  })
})
