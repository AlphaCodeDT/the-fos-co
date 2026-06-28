'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { SearchPicker, SearchPickerRow } from '@/components/account/SearchPicker'
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
    <div className="space-y-2">
      {value.founderId ? (
        <input type="hidden" name={founderFieldName} value={value.founderId} />
      ) : value.displayName.trim() ? (
        <input type="hidden" name={nameFieldName} value={value.displayName.trim()} />
      ) : null}

      <SearchPicker
        inputId={inputId}
        label="Team member"
        placeholder="Search by name or enter manually"
        query={value.displayName}
        onQueryChange={(displayName) => {
          onChange({
            founderId: null,
            displayName,
            linkedProfile: null,
          })
        }}
        results={value.linkedProfile ? [] : results}
        isOpen={isOpen && !value.linkedProfile}
        onOpenChange={setIsOpen}
        isSearching={isSearching && !value.linkedProfile}
        getKey={(result) => result.id}
        onFocus={() => {
          if (!value.linkedProfile && results.length > 0) {
            setIsOpen(true)
          }
        }}
        renderOption={(result) => (
          <button
            type="button"
            className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-white/5"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectResult(result)}
          >
            <SearchPickerRow
              avatar={
                <FounderAvatar
                  name={result.name}
                  avatarUrl={result.avatarUrl}
                  sizeClassName="mt-0.5 h-8 w-8 text-sm"
                />
              }
              primary={result.name}
              secondary={formatFounderSearchSubtitle(result) || null}
            />
          </button>
        )}
        footer={
          value.linkedProfile ? (
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
          ) : null
        }
      />
    </div>
  )
}
