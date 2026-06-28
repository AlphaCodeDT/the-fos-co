'use client'

import Link from 'next/link'
import { useEffect, useId, useRef } from 'react'

import { StartupSearchPicker } from '@/components/account/StartupSearchPicker'
import { Button } from '@/components/ui/button'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

type AddStartupPanelProps = {
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function AddStartupPanel({ onClose, triggerRef }: AddStartupPanelProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialogEl = panelRef.current
    if (!dialogEl) return

    const root: HTMLDivElement = dialogEl
    const focusables = root.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const elements = root.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [onClose, triggerRef])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-brand-black/70"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-brand-white/10 bg-brand-black p-6 shadow-xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-brand-white">
              Add your startup
            </h2>
            <p className="mt-1 text-sm text-brand-white/60">
              Search for an existing listing to claim, or create a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-brand-white/50 transition-colors hover:bg-brand-white/5 hover:text-brand-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <StartupSearchPicker />

        <div className="mt-6 border-t border-brand-white/10 pt-6">
          <p className="text-sm text-brand-white/60">Can&apos;t find your startup?</p>
          <Button asChild variant="outline" className="mt-3">
            <Link href="/account/startups/new" onClick={onClose}>
              Create a new one
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
