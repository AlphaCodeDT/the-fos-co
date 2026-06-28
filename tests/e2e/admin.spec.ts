import { expect, test } from '@playwright/test'

import {
  loginToPayloadAdmin,
  savePayloadDoc,
  setClaimStatusViaApi,
  setSelectField,
} from './lib/admin-helpers'
import { loginAsPrimaryFounder, requireRunState } from './lib/auth'
import { e2eFounderName, e2eStartupName } from './lib/constants'
import {
  createE2eRejectStartup,
  findStartupByName,
  getBootstrapPayload,
  getFirstIndustryId,
  submitClaimForFounder,
} from './lib/payload-bootstrap'
import { appendCreatedId } from './lib/run-state'

const hasAdminCreds = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)

test.describe.configure({ mode: 'serial' })

test.describe('admin moderation flows', () => {
  test.skip(!hasAdminCreds, 'ADMIN_EMAIL and ADMIN_PASSWORD are required for admin E2E.')

  test('approves founder, startup, and claim', async ({ page, browser }) => {
    const state = requireRunState()
    const adminEmail = process.env.ADMIN_EMAIL!
    const adminPassword = process.env.ADMIN_PASSWORD!

    await loginToPayloadAdmin(page, adminEmail, adminPassword)

    await page.goto(`/admin/collections/founders/${state.founders.primary}`)
    await setSelectField(page, 'Moderation Status', 'Approved')
    await savePayloadDoc(page)

    await page.goto('/founders')
    await page.locator('#q').fill('E2E__')
    await page.getByRole('button', { name: 'Apply filters' }).click()
    await expect(page.getByRole('link', { name: e2eFounderName(state.token, 'Founder') })).toBeVisible({
      timeout: 15_000,
    })

    const startupName = e2eStartupName(state.token, 'Startup')
    const freshState = requireRunState()
    const startupId = freshState.createdIds.startups[0]
    expect(startupId, 'founder.spec should have created the test startup').toBeTruthy()

    await page.goto(`/admin/collections/startups/${startupId}`)
    await setSelectField(page, 'Moderation Status', 'Approved')
    await savePayloadDoc(page)

    await page.goto('/startups')
    await page.locator('#q').fill('E2E__')
    await page.getByRole('button', { name: 'Apply filters' }).click()
    await expect(page.getByRole('link', { name: startupName })).toBeVisible({ timeout: 15_000 })

    const payload = await getBootstrapPayload()
    const approvedStartup = await findStartupByName(payload, startupName)
    expect(approvedStartup?.slug).toBeTruthy()
    await page.goto(`/startups/${approvedStartup!.slug}`)
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Company details' })).toBeVisible()
    const sectionHeadings = await page.locator('main h2').allTextContents()
    const aboutIndex = sectionHeadings.findIndex((text) => text === 'About')
    const companyDetailsIndex = sectionHeadings.findIndex((text) => text === 'Company details')
    expect(aboutIndex).toBeGreaterThanOrEqual(0)
    expect(companyDetailsIndex).toBeGreaterThanOrEqual(0)
    expect(aboutIndex).toBeLessThan(companyDetailsIndex)
    const applyLink = page.getByRole('link', { name: 'Apply' })
    await expect(applyLink).toBeVisible()
    await expect(applyLink).toHaveAttribute('href', 'https://example.com/apply')
    await expect(page.getByText('E2E Engineer')).toBeVisible()

    await page.goto(`/admin/collections/startups/${state.startups.claimable}`)
    await setClaimStatusViaApi(state.startups.claimable, 'claimed')

    const founderContext = await browser.newContext()
    const founderPage = await founderContext.newPage()
    await loginAsPrimaryFounder(founderPage)
    await founderPage.getByRole('link', { name: 'My startups' }).click()
    await expect(
      founderPage.getByText(e2eStartupName(state.token, 'Claimable')),
    ).toBeVisible({ timeout: 15_000 })
    await founderContext.close()
  })

  test('rejects a claim and clears it from the founder claims list', async ({ page, browser }) => {
    const state = requireRunState()
    const adminEmail = process.env.ADMIN_EMAIL!
    const adminPassword = process.env.ADMIN_PASSWORD!

    const payload = await getBootstrapPayload()
    const industryId = await getFirstIndustryId(payload)
    const rejectStartup = await createE2eRejectStartup({
      payload,
      token: state.token,
      industryId,
    })

    appendCreatedId('startups', rejectStartup.id)

    await submitClaimForFounder({
      payload,
      startupId: rejectStartup.id,
      founderId: state.founders.primary,
    })

    await loginToPayloadAdmin(page, adminEmail, adminPassword)
    await page.goto(`/admin/collections/startups/${rejectStartup.id}`)

    await setClaimStatusViaApi(rejectStartup.id, 'unclaimed')

    const founderContext = await browser.newContext()
    const founderPage = await founderContext.newPage()
    await loginAsPrimaryFounder(founderPage)
    await founderPage.goto('/account/claims')
    await expect(
      founderPage.getByText(e2eStartupName(state.token, 'Reject')),
    ).not.toBeVisible({ timeout: 15_000 })
    await founderContext.close()
  })
})
