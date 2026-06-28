'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ClaimStartupForm } from '@/components/account/ClaimStartupForm'
import { SearchPicker, SearchPickerRow } from '@/components/account/SearchPicker'
import { searchStartupsAction } from '@/lib/auth/account-actions'
import type { StartupSearchResult } from '@/lib/startup-search-utils'

function StartupLogo({
  name,
  logoUrl,
}: {
  name: string
  logoUrl: string | null
}) {
  if (logoUrl) {
    return (
      <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-brand-white/10">
        <Image src={logoUrl} alt="" fill className="object-cover" sizes="32px" />
      </div>
    )
  }

  return (
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-white/10 text-sm font-semibold text-brand-yellow">
      {name.charAt(0)}
    </div>
  )
}

function chipClassName(result: StartupSearchResult): string {
  if (result.isClaimable) {
    return 'border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow'
  }

  if (result.isOwnedBySelf) {
    return 'border-brand-white/20 bg-brand-white/5 text-brand-white/70'
  }

  return 'border-brand-white/10 bg-brand-white/5 text-brand-white/50'
}

export function StartupSearchPicker() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StartupSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeout = window.setTimeout(async () => {
      setIsSearching(true)
      try {
        const matches = await searchStartupsAction(trimmed)
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
  }, [query])

  function handleClaimSuccess() {
    router.refresh()
  }

  return (
    <SearchPicker
      inputId="startup-search"
      label="Is your startup already listed?"
      placeholder="Search by startup name"
      query={query}
      onQueryChange={setQuery}
      results={results}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isSearching={isSearching}
      getKey={(result) => result.slug}
      renderOption={(result) => (
        <div
          className={`flex w-full items-start gap-3 px-3 py-2.5 ${
            result.isClaimable ? '' : 'opacity-70'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <SearchPickerRow
              avatar={<StartupLogo name={result.name} logoUrl={result.logoUrl} />}
              primary={result.name}
              secondary={result.tagline}
            />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${chipClassName(result)}`}
            >
              {result.chipLabel}
            </span>
            {result.isClaimable ? (
              <ClaimStartupForm
                startupId={result.id}
                size="sm"
                onSuccess={handleClaimSuccess}
              />
            ) : null}
          </div>
        </div>
      )}
    />
  )
}
