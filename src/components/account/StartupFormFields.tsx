'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OpportunitySection } from '@/components/account/OpportunitySection'
import { SocialLinksFormSection } from '@/components/account/SocialLinksFormSection'
import {
  STARTUP_STAGE_OPTIONS,
  selectClassName,
  textareaClassName,
} from '@/components/account/startup-form-constants'
import { TeamSection, type CurrentFounder } from '@/components/account/TeamSection'
import { lexicalToPlainText } from '@/lib/richtext'
import type { Industry, Organization, Startup } from '@/payload-types'

export function StartupFormFields({
  startup,
  industries,
  organizations,
  currentFounder,
}: {
  startup?: Startup
  industries: Industry[]
  organizations: Organization[]
  currentFounder: CurrentFounder
}) {
  const industryId =
    startup && typeof startup.industry === 'object' && startup.industry
      ? startup.industry.id
      : typeof startup?.industry === 'number'
        ? startup.industry
        : undefined

  const selectedOrganizations = new Set(
    (startup?.organizations || [])
      .map((item) => (typeof item === 'object' ? item.id : item))
      .filter((id): id is number => typeof id === 'number'),
  )

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Startup name</Label>
          <Input id="name" name="name" defaultValue={startup?.name} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={startup?.tagline || ''} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={startup ? lexicalToPlainText(startup.description) : ''}
            className={textareaClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            name="industry"
            className={selectClassName}
            defaultValue={industryId || ''}
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select id="stage" name="stage" className={selectClassName} defaultValue={startup?.stage || ''}>
            <option value="">Select stage</option>
            {STARTUP_STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team size</Label>
          <Input
            id="teamSize"
            name="teamSize"
            type="number"
            min={1}
            defaultValue={startup?.teamSize ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={startup?.city || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={startup?.state || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={startup?.country || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundingStatus">Funding status</Label>
          <Input
            id="fundingStatus"
            name="fundingStatus"
            defaultValue={startup?.fundingStatus || ''}
            placeholder="e.g. Bootstrapped, Seed, Series A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="foundedYear">Founded year</Label>
          <Input
            id="foundedYear"
            name="foundedYear"
            type="number"
            min={1900}
            max={2100}
            defaultValue={startup?.foundedYear ?? ''}
          />
        </div>
      </div>

      <SocialLinksFormSection
        values={{
          linkedIn: startup?.linkedIn,
          twitter: startup?.twitter,
          instagram: startup?.instagram,
          facebook: startup?.facebook,
          youtube: startup?.youtube,
          github: startup?.github,
          website: startup?.website,
        }}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-brand-white">
          Backed by (accelerators &amp; incubators)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {organizations.map((organization) => (
            <label key={organization.id} className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="organizations"
                value={organization.id}
                defaultChecked={selectedOrganizations.has(organization.id)}
                className="accent-brand-yellow"
              />
              {organization.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ['isHiring', 'Hiring', startup?.isHiring],
            ['isRaising', 'Raising', startup?.isRaising],
            ['isLookingForCoFounder', 'Looking for co-founder', startup?.isLookingForCoFounder],
            ['womenLed', 'Women-led', startup?.womenLed],
          ] as const
        ).map(([name, label, checked]) => (
          <label key={name} className="flex items-center gap-2 text-sm text-brand-white/80">
            <input
              type="checkbox"
              name={name}
              defaultChecked={Boolean(checked)}
              className="accent-brand-yellow"
            />
            {label}
          </label>
        ))}
      </div>

      <TeamSection team={startup?.team} currentFounder={currentFounder} />
      <OpportunitySection opportunities={startup?.opportunities} />
    </>
  )
}
