import { expect, type ConsoleMessage, type Page } from '@playwright/test'

export type ConsoleGuard = {
  dispose: () => void
  assertClean: () => void
}

function isIgnorableConsoleError(text: string): boolean {
  // Browser network failures for subresources (e.g. broken next/image URLs).
  if (text.startsWith('Failed to load resource:')) return true
  return false
}

export function attachConsoleErrorGuard(page: Page): ConsoleGuard {
  const errors: string[] = []

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isIgnorableConsoleError(text)) return
    errors.push(`[console.error] ${text}`)
  }

  const onPageError = (error: Error) => {
    errors.push(`[pageerror] ${error.message}`)
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  return {
    dispose: () => {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
    },
    assertClean: () => {
      expect(
        errors,
        errors.length > 0 ? `Console errors on ${page.url()}:\n${errors.join('\n')}` : undefined,
      ).toEqual([])
    },
  }
}
