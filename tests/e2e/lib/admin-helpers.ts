import type { Page } from '@playwright/test'

import { getBootstrapPayload } from './payload-bootstrap'

export async function loginToPayloadAdmin(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/admin/login')
  await page.getByRole('textbox', { name: /^Email/ }).fill(email)
  await page.getByRole('textbox', { name: /^Password/ }).fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30_000 })
}

export async function openCollection(page: Page, collectionLabel: string): Promise<void> {
  await page.getByRole('link', { name: collectionLabel, exact: true }).click()
  await page.waitForURL(/\/admin\/collections\//, { timeout: 15_000 })
}

export async function searchCollectionDoc(page: Page, query: string): Promise<void> {
  const search = page.getByPlaceholder(/search/i).first()
  if (await search.isVisible().catch(() => false)) {
    await search.fill(query)
    await page.waitForTimeout(500)
  }
}

export async function openDocByName(page: Page, name: string): Promise<void> {
  await page.getByRole('link', { name }).first().click()
  await page.waitForURL(/\/admin\/collections\/[^/]+\/\d+/, { timeout: 15_000 })
}

export async function savePayloadDoc(page: Page): Promise<void> {
  const save = page.getByRole('button', { name: /^save$/i }).first()
  await save.click({ timeout: 15_000 })
  await page.waitForTimeout(1500)
}

function fieldRoot(page: Page, label: string) {
  return page.getByText(new RegExp(`^${label}`)).locator('..')
}

export async function setSelectField(page: Page, label: string, optionLabel: string): Promise<void> {
  const root = fieldRoot(page, label)
  await root.scrollIntoViewIfNeeded()

  await root.getByRole('combobox').click()

  const listbox = page.getByRole('listbox')
  await listbox.getByRole('option', { name: optionLabel, exact: true }).click()
}

export async function setClaimStatus(
  page: Page,
  status: 'Unclaimed' | 'Pending' | 'Claimed',
): Promise<void> {
  await setSelectField(page, 'Claim Status', status)
}

/** Payload named-group claim fields do not render in admin UI; use API for E2E claim moderation. */
export async function setClaimStatusViaApi(
  startupId: number,
  status: 'unclaimed' | 'pending' | 'claimed',
): Promise<void> {
  const payload = await getBootstrapPayload()
  const claim =
    status === 'unclaimed'
      ? { claimStatus: status, claimedBy: null, claimedAt: null }
      : { claimStatus: status }

  await payload.update({
    collection: 'startups',
    id: startupId,
    overrideAccess: true,
    data: { claim },
  })
}
