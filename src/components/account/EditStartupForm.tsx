'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import { FormMessage } from '@/components/account/AccountShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  updateStartupAction,
  uploadMediaAction,
  type AccountActionState,
} from '@/lib/auth/account-actions'
import { lexicalToPlainText } from '@/lib/richtext'
import type { Industry, Startup } from '@/payload-types'

const initialState: AccountActionState = {}

export function EditStartupForm({
  startup,
  industries,
}: {
  startup: Startup
  industries: Industry[]
}) {
  const [state, action, pending] = useActionState(updateStartupAction, initialState)
  const [logoId, setLogoId] = useState<number | undefined>(
    typeof startup.logo === 'object' && startup.logo ? startup.logo.id : undefined,
  )
  const [uploadError, setUploadError] = useState<string>()
  const [uploading, setUploading] = useState(false)

  const industryId =
    typeof startup.industry === 'object' && startup.industry ? startup.industry.id : startup.industry

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(undefined)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', `${startup.name} logo`)

    const result = await uploadMediaAction(formData)

    if (result.error) {
      setUploadError(result.error)
    } else if (result.id) {
      setLogoId(result.id)
    }

    setUploading(false)
  }

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6">
      <input type="hidden" name="startupId" value={startup.id} />
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}
      {logoId ? <input type="hidden" name="logoId" value={logoId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Startup name</Label>
          <Input id="name" name="name" defaultValue={startup.name} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={startup.tagline || ''} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={lexicalToPlainText(startup.description)}
            className="flex w-full rounded-md border border-brand-white/20 bg-brand-black px-3 py-2 text-sm text-brand-white placeholder:text-brand-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="logo">Logo</Label>
          <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            name="industry"
            className="flex h-10 w-full rounded-md border border-brand-white/20 bg-brand-black px-3 text-sm text-brand-white"
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
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={startup.website || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={startup.city || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={startup.country || ''} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ['isHiring', 'Hiring', startup.isHiring],
            ['isRaising', 'Raising', startup.isRaising],
            ['isLookingForCoFounder', 'Looking for co-founder', startup.isLookingForCoFounder],
            ['womenLed', 'Women-led', startup.womenLed],
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

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? 'Saving…' : 'Save startup'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/account/startups">Back</Link>
        </Button>
      </div>
    </form>
  )
}
