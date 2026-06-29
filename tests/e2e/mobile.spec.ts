import { expect, test } from '@playwright/test'

import { loginAsPrimaryFounder } from './lib/auth'

const MOBILE_VIEWPORT = { width: 390, height: 844 }

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
  expect(hasOverflow).toBe(false)
}

test.describe('mobile layout smoke', () => {
  test.use({ viewport: MOBILE_VIEWPORT })

  test('hamburger opens nav sheet and closes on navigation', async ({ page }) => {
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await expect(menuButton).toBeVisible()

    await menuButton.click()

    const sheet = page.getByRole('dialog')
    const foundersNavLink = sheet.getByRole('link', { name: 'Founders', exact: true })
    await expect(foundersNavLink).toBeVisible()

    await foundersNavLink.click()
    await page.waitForURL(/\/founders/)

    await expect(sheet).not.toBeVisible()
    await expect(menuButton).toBeVisible()
  })

  test('no horizontal overflow on public routes', async ({ page }) => {
    for (const path of ['/', '/founders', '/startups', '/programs', '/stories', '/login']) {
      await page.goto(path)
      await assertNoHorizontalOverflow(page)
    }
  })

  test('no horizontal overflow on account dashboard', async ({ page }) => {
    await loginAsPrimaryFounder(page)
    await assertNoHorizontalOverflow(page)

    await expect(page.getByRole('link', { name: 'My profile' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'My startups' })).toBeVisible()
  })
})
