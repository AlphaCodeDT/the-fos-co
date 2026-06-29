import { expect, test } from '@playwright/test'

import { requireRunState } from './lib/auth'
import { attachConsoleErrorGuard } from './lib/console-guard'
import { e2eFounderName, e2eOrgName, e2eStartupName } from './lib/constants'
import { requireE2eProdGuard } from './lib/guards'
import { getBootstrapPayload } from './lib/payload-bootstrap'

test.describe.configure({ mode: 'serial' })

test.describe('public directory smoke', () => {
  test.beforeAll(() => {
    requireE2eProdGuard()
    requireRunState()
  })

  test('directory and profile pages have no console errors', async ({ page }) => {
    const state = requireRunState()
    const payload = await getBootstrapPayload()

    const founder = await payload.findByID({
      collection: 'founders',
      id: state.founders.primary,
      overrideAccess: true,
    })

    const startup = await payload.findByID({
      collection: 'startups',
      id: state.startups.orgLinked,
      overrideAccess: true,
    })

    const routes: Array<{ path: string; ready: () => Promise<void> }> = [
      {
        path: '/founders',
        ready: async () => {
          const founderCard = page.getByRole('link', {
            name: new RegExp(e2eFounderName(state.token, 'Founder')),
          })
          await expect(founderCard).toBeVisible()
          await expect(founderCard.getByText(e2eOrgName(state.token))).toBeVisible()
        },
      },
      {
        path: '/startups',
        ready: async () => {
          await expect(
            page.getByRole('link', { name: e2eStartupName(state.token, 'OrgLinked') }),
          ).toBeVisible()
        },
      },
      {
        path: '/programs',
        ready: async () => {
          await expect(page.getByRole('heading', { name: 'Programs', exact: true })).toBeVisible()
        },
      },
      {
        path: `/founders/${founder.slug}`,
        ready: async () => {
          await expect(page.getByRole('heading', { name: 'Incubated at', exact: true })).toBeVisible()
          await expect(page.getByRole('link', { name: e2eOrgName(state.token) })).toBeVisible()
        },
      },
      {
        path: `/startups/${startup.slug}`,
        ready: async () => {
          await expect(page.getByRole('heading', { name: 'Incubated at', exact: true })).toBeVisible()
          await expect(page.getByRole('link', { name: e2eOrgName(state.token) })).toBeVisible()
        },
      },
    ]

    for (const { path, ready } of routes) {
      const guard = attachConsoleErrorGuard(page)
      try {
        await page.goto(path)
        await ready()
        guard.assertClean()
      } finally {
        guard.dispose()
      }
    }
  })
})
