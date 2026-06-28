'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildDirectorySearchParams, type DirectoryLocationFilters } from '@/lib/community-filters'
import type { Industry, Organization } from '@/payload-types'
import { cn } from '@/lib/utils'

type CommunityFilterBarProps = {
  variant: 'founders' | 'startups'
  industries: Industry[]
  organizations: Organization[]
  locationFilters: DirectoryLocationFilters
  className?: string
}

function getParam(params: URLSearchParams, key: string): string {
  return params.get(key) || ''
}

export function CommunityFilterBar({
  variant,
  industries,
  organizations,
  locationFilters,
  className,
}: CommunityFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = new URLSearchParams(searchParams.toString())
  const basePath = pathname

  const [selectedState, setSelectedState] = useState(() => getParam(current, 'state'))
  const [selectedCity, setSelectedCity] = useState(() => getParam(current, 'city'))

  useEffect(() => {
    setSelectedState(getParam(current, 'state'))
    setSelectedCity(getParam(current, 'city'))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when URL changes
  }, [searchParams.toString()])

  const cityOptions = selectedState ? locationFilters.citiesByState[selectedState] ?? [] : []

  function navigate(updates: Record<string, string | null>) {
    const href = buildDirectorySearchParams(
      basePath,
      Object.fromEntries(current.entries()),
      updates,
    )
    startTransition(() => {
      router.push(href)
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const state = (formData.get('state') as string) || null
    const city = (formData.get('city') as string) || null

    navigate({
      industry: (formData.get('industry') as string) || null,
      organization: (formData.get('organization') as string) || null,
      q: (formData.get('q') as string)?.trim() || null,
      verified: formData.get('verified') === 'on' ? '1' : null,
      state,
      city: state && city ? city : null,
      cohort: (formData.get('cohort') as string) || null,
      ...(variant === 'startups'
        ? {
            womenLed: formData.get('womenLed') === 'on' ? '1' : null,
            hiring: formData.get('hiring') === 'on' ? '1' : null,
            raising: formData.get('raising') === 'on' ? '1' : null,
            cofounder: formData.get('cofounder') === 'on' ? '1' : null,
          }
        : {}),
    })
  }

  function handleStateChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextState = event.target.value
    setSelectedState(nextState)
    setSelectedCity('')
  }

  function clearFilters() {
    startTransition(() => {
      router.push(basePath)
    })
  }

  const selectClassName =
    'h-10 w-full rounded-md border border-brand-white/20 bg-brand-black px-3 text-sm text-brand-white focus:border-brand-yellow focus:outline-none'

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'space-y-4 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-4 md:p-5',
        isPending && 'opacity-70',
        className,
      )}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-brand-white/80">
            Industry
          </Label>
          <select
            id="industry"
            name="industry"
            defaultValue={getParam(current, 'industry')}
            className={selectClassName}
          >
            <option value="">All industries</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.slug}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization" className="text-brand-white/80">
            Backed by
          </Label>
          <select
            id="organization"
            name="organization"
            defaultValue={getParam(current, 'organization')}
            className={selectClassName}
          >
            <option value="">All backers</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.slug}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-brand-white/80">
            State
          </Label>
          <select
            id="state"
            name="state"
            value={selectedState}
            onChange={handleStateChange}
            className={selectClassName}
          >
            <option value="">All states</option>
            {locationFilters.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-brand-white/80">
            City
          </Label>
          <select
            id="city"
            name="city"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className={selectClassName}
            disabled={!selectedState}
          >
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cohort" className="text-brand-white/80">
            Cohort year
          </Label>
          <select
            id="cohort"
            name="cohort"
            defaultValue={getParam(current, 'cohort')}
            className={selectClassName}
          >
            <option value="">All cohort years</option>
            {locationFilters.cohortYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="q" className="text-brand-white/80">
            Search by name
          </Label>
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Search..."
            defaultValue={getParam(current, 'q')}
            className="border-brand-white/20 bg-brand-black text-brand-white placeholder:text-brand-white/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-brand-white/80">
          <input
            type="checkbox"
            name="verified"
            defaultChecked={getParam(current, 'verified') === '1'}
            className="accent-brand-yellow"
          />
          Verified only
        </label>

        {variant === 'startups' ? (
          <>
            <label className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="womenLed"
                defaultChecked={getParam(current, 'womenLed') === '1'}
                className="accent-brand-yellow"
              />
              Women-led
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="hiring"
                defaultChecked={getParam(current, 'hiring') === '1'}
                className="accent-brand-yellow"
              />
              Hiring
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="raising"
                defaultChecked={getParam(current, 'raising') === '1'}
                className="accent-brand-yellow"
              />
              Raising
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="cofounder"
                defaultChecked={getParam(current, 'cofounder') === '1'}
                className="accent-brand-yellow"
              />
              Looking for co-founder
            </label>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90">
          Apply filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
        >
          Clear
        </Button>
      </div>
    </form>
  )
}
