'use client'

import { useActionState, useState } from 'react'

import { AccountShell, FormMessage } from '@/components/account/AccountShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  updateProfileAction,
  uploadMediaAction,
  type AccountActionState,
} from '@/lib/auth/account-actions'
import { lexicalToPlainText } from '@/lib/richtext'
import type { Founder, Industry, Organization } from '@/payload-types'

const initialState: AccountActionState = {}

export function ProfileForm({
  founder,
  industries,
  organizations,
}: {
  founder: Founder
  industries: Industry[]
  organizations: Organization[]
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState)
  const [avatarId, setAvatarId] = useState<number | undefined>(
    typeof founder.avatar === 'object' && founder.avatar ? founder.avatar.id : undefined,
  )
  const [uploadError, setUploadError] = useState<string>()
  const [uploading, setUploading] = useState(false)

  const selectedIndustries = new Set(
    (founder.industries || [])
      .map((item) => (typeof item === 'object' ? item.id : item))
      .filter((id): id is number => typeof id === 'number'),
  )

  const selectedOrganizations = new Set(
    (founder.organizations || [])
      .map((item) => (typeof item === 'object' ? item.id : item))
      .filter((id): id is number => typeof id === 'number'),
  )

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(undefined)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', `${founder.name} avatar`)

    const result = await uploadMediaAction(formData)

    if (result.error) {
      setUploadError(result.error)
    } else if (result.id) {
      setAvatarId(result.id)
    }

    setUploading(false)
  }

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6">
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}
      {avatarId ? <input type="hidden" name="avatarId" value={avatarId} /> : null}

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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="avatar">Avatar</Label>
          <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={founder.city || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={founder.state || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={founder.country || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedIn">LinkedIn</Label>
          <Input id="linkedIn" name="linkedIn" defaultValue={founder.linkedIn || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input id="twitter" name="twitter" defaultValue={founder.twitter || ''} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={founder.website || ''} />
        </div>
      </div>

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

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-brand-white">Organizations</legend>
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

      <Button type="submit" disabled={pending || uploading}>
        {pending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}
