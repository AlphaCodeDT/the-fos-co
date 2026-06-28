'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { searchFoundersAction } from '@/lib/auth/account-actions'
import {
  formatFounderSearchSubtitle,
  type FounderSearchResult,
} from '@/lib/founder-search-utils'

export type FounderPickerValue = {
  founderId: number | null
  displayName: string
  linkedProfile: FounderSearchResult | null
}

type FounderSearchPickerProps = {
  inputId: string
  value: FounderPickerValue
  onChange: (value: FounderPickerValue) => void
  founderFieldName: string
  nameFieldName: string
}

function FounderAvatar({
  name,
  avatarUrl,
  sizeClassName,
}: {
  name: string
  avatarUrl: string | null
  sizeClassName: string
}) {
  if (avatarUrl) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-brand-white/10 ${sizeClassName}`}>
        <Image src={avatarUrl} alt="" fill className="object-cover" sizes="32px" />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-white/10 font-semibold text-brand-yellow ${sizeClassName}`}
    >
      {name.charAt(0)}
    </div>
  )
}

export function FounderSearchPicker({
  inputId,
  value,
  onChange,
  founderFieldName,
  nameFieldName,
}: FounderSearchPickerProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [results, setResults] = useState<FounderSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (value.linkedProfile) {
      setResults([])
      setIsOpen(false)
      return
    }

    const query = value.displayName.trim()
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeout = window.setTimeout(async () => {
      setIsSearching(true)
      try {
        const matches = await searchFoundersAction(query)
        setResults(matches)
        setIsOpen(matches.length > 0)
      } catch {
        setResults([])
        setIsOpen(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [value.displayName, value.linkedProfile])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectResult(result: FounderSearchResult) {
    onChange({
      founderId: result.id,
      displayName: result.name,
      linkedProfile: result,
    })
    setIsOpen(false)
    setResults([])
  }

  function clearLink() {
    onChange({
      founderId: null,
      displayName: value.displayName,
      linkedProfile: null,
    })
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {value.founderId ? (
        <input type="hidden" name={founderFieldName} value={value.founderId} />
      ) : value.displayName.trim() ? (
        <input type="hidden" name={nameFieldName} value={value.displayName.trim()} />
      ) : null}

      <Label htmlFor={inputId}>Team member</Label>
      <Input
        id={inputId}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        placeholder="Search by name or enter manually"
        value={value.displayName}
        onChange={(event) => {
          onChange({
            founderId: null,
            displayName: event.target.value,
            linkedProfile: null,
          })
        }}
        onFocus={() => {
          if (!value.linkedProfile && results.length > 0) {
            setIsOpen(true)
          }
        }}
      />

      {value.linkedProfile ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-xs font-medium text-brand-yellow">
            ✓ Linked to FoS profile
          </span>
          <button
            type="button"
            onClick={clearLink}
            className="text-xs text-brand-white/50 underline-offset-2 hover:text-brand-white hover:underline"
          >
            Unlink
          </button>
        </div>
      ) : null}

      {isSearching ? (
        <p className="text-xs text-brand-white/40">Searching…</p>
      ) : null}

      {isOpen && results.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-brand-white/10 bg-brand-black shadow-lg"
        >
          {results.map((result) => {
            const subtitle = formatFounderSearchSubtitle(result)

            return (
              <li key={result.id} role="option">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-white/5"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectResult(result)}
                >
                  <FounderAvatar
                    name={result.name}
                    avatarUrl={result.avatarUrl}
                    sizeClassName="mt-0.5 h-8 w-8 text-sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-brand-white">{result.name}</span>
                    {subtitle ? (
                      <span className="mt-0.5 block text-xs text-brand-white/50">{subtitle}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
