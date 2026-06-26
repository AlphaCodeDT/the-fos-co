'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildDirectorySearchParams } from '@/lib/community-filters'
import type { Industry, Organization } from '@/payload-types'
import { cn } from '@/lib/utils'

type CommunityFilterBarProps = {
  variant: 'founders' | 'startups'
  industries: Industry[]
  organizations: Organization[]
  className?: string
}

function getParam(params: URLSearchParams, key: string): string {
  return params.get(key) || ''
}

export function CommunityFilterBar({
  variant,
  industries,
  organizations,
  className,
}: CommunityFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = new URLSearchParams(searchParams.toString())
  const basePath = pathname

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
    navigate({
      industry: (formData.get('industry') as string) || null,
      organization: (formData.get('organization') as string) || null,
      q: (formData.get('q') as string)?.trim() || null,
      verified: formData.get('verified') === 'on' ? '1' : null,
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
            Organization
          </Label>
          <select
            id="organization"
            name="organization"
            defaultValue={getParam(current, 'organization')}
            className={selectClassName}
          >
            <option value="">All organizations</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.slug}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
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
