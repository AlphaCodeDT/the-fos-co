'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { buildDirectorySearchParams, type DirectoryLocationFilters } from '@/lib/community-filters'
import { formatLocationCity } from '@/lib/format-location'
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

const FILTER_KEYS = [
  'industry',
  'organization',
  'q',
  'verified',
  'state',
  'city',
  'cohort',
  'women',
  'open',
  'cofounder',
  'womenLed',
  'hiring',
  'raising',
] as const

function countActiveFilters(params: URLSearchParams): number {
  return FILTER_KEYS.filter((key) => {
    const value = params.get(key)
    return value !== null && value !== ''
  }).length
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
  const [sheetOpen, setSheetOpen] = useState(false)

  const current = new URLSearchParams(searchParams.toString())
  const basePath = pathname
  const activeFilterCount = useMemo(() => countActiveFilters(current), [searchParams.toString()])

  const [selectedState, setSelectedState] = useState(() => getParam(current, 'state'))
  const [selectedCity, setSelectedCity] = useState(() => getParam(current, 'city'))

  useEffect(() => {
    setSelectedState(getParam(current, 'state'))
    setSelectedCity(getParam(current, 'city'))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when URL changes
  }, [searchParams.toString()])

  useEffect(() => {
    setSheetOpen(false)
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
      ...(variant === 'founders'
        ? {
            women: formData.get('women') === 'on' ? '1' : null,
            open: formData.get('open') === 'on' ? '1' : null,
            cofounder: formData.get('cofounder') === 'on' ? '1' : null,
          }
        : {}),
      ...(variant === 'startups'
        ? {
            womenLed: formData.get('womenLed') === 'on' ? '1' : null,
            hiring: formData.get('hiring') === 'on' ? '1' : null,
            raising: formData.get('raising') === 'on' ? '1' : null,
            cofounder: formData.get('cofounder') === 'on' ? '1' : null,
          }
        : {}),
    })
    setSheetOpen(false)
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
    setSheetOpen(false)
  }

  const selectClassName =
    'h-10 w-full rounded-md border border-brand-white/20 bg-brand-black px-3 text-sm text-brand-white focus:border-brand-yellow focus:outline-none'

  const formFields = (
    <>
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
                {formatLocationCity(city)}
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
          <input
            type="checkbox"
            name="verified"
            defaultChecked={getParam(current, 'verified') === '1'}
            className="accent-brand-yellow"
          />
          Verified only
        </label>

        {variant === 'founders' ? (
          <>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="women"
                defaultChecked={getParam(current, 'women') === '1'}
                className="accent-brand-yellow"
              />
              Women founders
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="open"
                defaultChecked={getParam(current, 'open') === '1'}
                className="accent-brand-yellow"
              />
              Open to opportunities
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
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

        {variant === 'startups' ? (
          <>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="womenLed"
                defaultChecked={getParam(current, 'womenLed') === '1'}
                className="accent-brand-yellow"
              />
              Women-led
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="hiring"
                defaultChecked={getParam(current, 'hiring') === '1'}
                className="accent-brand-yellow"
              />
              Hiring
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="raising"
                defaultChecked={getParam(current, 'raising') === '1'}
                className="accent-brand-yellow"
              />
              Raising
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-brand-white/80">
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
        <Button type="submit" className="min-h-11 bg-brand-yellow text-brand-black hover:bg-brand-yellow/90">
          Apply filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="min-h-11 border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
        >
          Clear
        </Button>
      </div>
    </>
  )

  const formClassName = cn(
    'space-y-4 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-4 md:p-5',
    isPending && 'opacity-70',
    className,
  )

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-brand-white/20 bg-transparent text-brand-white hover:bg-brand-white/10"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="ml-2 rounded-full bg-brand-yellow/20 px-2 py-0.5 text-xs text-brand-yellow">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <form
              key={`mobile-${searchParams.toString()}`}
              onSubmit={handleSubmit}
              className={cn(formClassName, 'mt-2 border-0 bg-transparent p-0')}
            >
              {formFields}
            </form>
          </SheetContent>
        </Sheet>
        {activeFilterCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            className="min-h-11 text-brand-white/70 hover:text-brand-white"
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <form
        key={`desktop-${searchParams.toString()}`}
        onSubmit={handleSubmit}
        className={cn(formClassName, 'hidden md:block')}
      >
        {formFields}
      </form>
    </>
  )
}
