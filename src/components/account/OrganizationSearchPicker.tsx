'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { SearchPicker, SearchPickerRow } from '@/components/account/SearchPicker'
import { searchOrganizationsAction } from '@/lib/auth/account-actions'
import type { OrganizationSearchResult } from '@/lib/organization-search-utils'

type OrganizationSearchPickerProps = {
  inputId: string
  initialOrganizations: OrganizationSearchResult[]
}

function OrganizationAvatar({
  name,
  logoUrl,
  sizeClassName,
}: {
  name: string
  logoUrl: string | null
  sizeClassName: string
}) {
  if (logoUrl) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-md bg-brand-white/10 ${sizeClassName}`}>
        <Image src={logoUrl} alt="" fill className="object-cover" sizes="32px" />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-brand-white/10 font-semibold text-brand-yellow ${sizeClassName}`}
    >
      {name.charAt(0)}
    </div>
  )
}

export function OrganizationSearchPicker({
  inputId,
  initialOrganizations,
}: OrganizationSearchPickerProps) {
  const [selected, setSelected] = useState<OrganizationSearchResult[]>(initialOrganizations)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrganizationSearchResult[]>([])
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
        const matches = await searchOrganizationsAction(trimmed)
        const filtered = matches.filter((org) => !selected.some((item) => item.id === org.id))
        setResults(filtered)
        setIsOpen(filtered.length > 0)
      } catch {
        setResults([])
        setIsOpen(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [query, selected])

  function addOrganization(org: OrganizationSearchResult) {
    setSelected((current) => (current.some((item) => item.id === org.id) ? current : [...current, org]))
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  function removeOrganization(orgId: number) {
    setSelected((current) => current.filter((org) => org.id !== orgId))
  }

  const showEmptyState = query.trim().length >= 2 && !isSearching && results.length === 0 && !isOpen

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-brand-white">Backed by (accelerators &amp; incubators)</legend>

      <input type="hidden" name="organizationsTouched" value="1" />
      {selected.map((org) => (
        <input key={org.id} type="hidden" name="organizations" value={org.id} />
      ))}

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((org) => (
            <span
              key={org.id}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-yellow/35 bg-brand-yellow/10 px-2.5 py-1.5 text-xs font-semibold text-brand-yellow"
            >
              <OrganizationAvatar name={org.name} logoUrl={org.logoUrl} sizeClassName="h-5 w-5 text-[10px]" />
              <span>{org.chipLabel}</span>
              <button
                type="button"
                onClick={() => removeOrganization(org.id)}
                className="text-brand-white/50 hover:text-brand-white"
                aria-label={`Remove ${org.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <SearchPicker
        inputId={inputId}
        label="Add organization"
        placeholder="Search organizations by name"
        query={query}
        onQueryChange={setQuery}
        results={results}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isSearching={isSearching}
        getKey={(org) => org.id}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true)
          }
        }}
        renderOption={(org) => (
          <button
            type="button"
            className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-white/5"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => addOrganization(org)}
          >
            <SearchPickerRow
              avatar={
                <OrganizationAvatar
                  name={org.name}
                  logoUrl={org.logoUrl}
                  sizeClassName="mt-0.5 h-8 w-8 text-sm"
                />
              }
              primary={org.name}
              secondary={org.typeLabel}
            />
          </button>
        )}
        footer={
          showEmptyState ? (
            <p className="text-xs text-brand-white/50">
              Can&apos;t find your organization? Ask an admin to add it.
            </p>
          ) : null
        }
      />
    </fieldset>
  )
}
