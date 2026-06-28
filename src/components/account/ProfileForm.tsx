'use client'

import { useActionState } from 'react'

import { FormMessage } from '@/components/account/AccountShell'
import { CohortFormFields } from '@/components/account/CohortFormFields'
import { LocationSelectFields } from '@/components/account/LocationSelectFields'
import { ImageSubmitProgress } from '@/components/account/ImageSubmitProgress'
import { ImageUploadField } from '@/components/account/ImageUploadField'
import { OrganizationSearchPicker } from '@/components/account/OrganizationSearchPicker'
import { SocialLinksFormSection } from '@/components/account/SocialLinksFormSection'
import { useImageFormSubmit } from '@/components/account/useImageFormSubmit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction, type AccountActionState } from '@/lib/auth/account-actions'
import { resolveFounderAvatarUrl } from '@/lib/media-image'
import { lexicalToPlainText } from '@/lib/richtext'
import { mapOrganizationsToSearchResults } from '@/lib/organization-search-utils'
import type { Founder, Industry } from '@/payload-types'
import { selectClassName } from '@/components/account/startup-form-constants'

const GENDER_OPTIONS = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  { label: 'Other', value: 'other' },
] as const

const initialState: AccountActionState = {}

export function ProfileForm({
  founder,
  industries,
}: {
  founder: Founder
  industries: Industry[]
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState)
  const {
    setPendingFile,
    phase,
    uploadPercent,
    uploadIndeterminate,
    uploadError,
    handleSubmit,
    isBusy,
  } = useImageFormSubmit({
    kind: 'avatar',
    urlFieldName: 'avatarUrl',
    formAction,
    pending,
    actionState: state,
  })

  const selectedIndustries = new Set(
    (founder.industries || [])
      .map((item) => (typeof item === 'object' ? item.id : item))
      .filter((id): id is number => typeof id === 'number'),
  )

  const initialOrganizations = mapOrganizationsToSearchResults(founder.organizations)

  const initialAvatarUrl = resolveFounderAvatarUrl(founder)

  const submitLabel =
    phase === 'uploading'
      ? 'Uploading…'
      : phase === 'saving' || pending
        ? 'Saving…'
        : 'Save profile'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6"
    >
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={founder.name} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={founder.headline || ''} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            rows={6}
            defaultValue={lexicalToPlainText(founder.bio)}
            className="flex w-full rounded-md border border-brand-white/20 bg-brand-black px-3 py-2 text-sm text-brand-white placeholder:text-brand-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            id="avatar"
            label="Avatar"
            initialUrl={initialAvatarUrl}
            onFileSelect={setPendingFile}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            className={selectClassName}
            defaultValue={founder.gender || ''}
          >
            <option value="">Prefer not to say</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <LocationSelectFields
          className="sm:col-span-2"
          initialValues={{
            country: founder.country ?? undefined,
            state: founder.state ?? undefined,
            city: founder.city ?? undefined,
            stateCode: founder.stateCode ?? undefined,
          }}
        />
      </div>

      <CohortFormFields cohortName={founder.cohortName} cohortYear={founder.cohortYear} />

      <SocialLinksFormSection
        values={{
          linkedIn: founder.linkedIn,
          twitter: founder.twitter,
          instagram: founder.instagram,
          facebook: founder.facebook,
          youtube: founder.youtube,
          github: founder.github,
          website: founder.website,
        }}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-brand-white">Industries</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {industries.map((industry) => (
            <label key={industry.id} className="flex items-center gap-2 text-sm text-brand-white/80">
              <input
                type="checkbox"
                name="industries"
                value={industry.id}
                defaultChecked={selectedIndustries.has(industry.id)}
                className="accent-brand-yellow"
              />
              {industry.name}
            </label>
          ))}
        </div>
      </fieldset>

      <OrganizationSearchPicker inputId="organizations" initialOrganizations={initialOrganizations} />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-brand-white/80">
          <input
            type="checkbox"
            name="lookingForCoFounder"
            defaultChecked={Boolean(founder.lookingForCoFounder)}
            className="accent-brand-yellow"
          />
          Looking for co-founder
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-white/80">
          <input
            type="checkbox"
            name="openToOpportunities"
            defaultChecked={Boolean(founder.openToOpportunities)}
            className="accent-brand-yellow"
          />
          Open to opportunities
        </label>
      </div>

      <div className="space-y-3">
        <ImageSubmitProgress
          phase={phase}
          uploadPercent={uploadPercent}
          uploadIndeterminate={uploadIndeterminate}
        />
        <Button type="submit" disabled={isBusy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
