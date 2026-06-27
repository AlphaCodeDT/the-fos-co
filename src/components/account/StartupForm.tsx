'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import { AccountShell, FormMessage } from '@/components/account/AccountShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createStartupAction,
  uploadMediaAction,
  type AccountActionState,
} from '@/lib/auth/account-actions'
import type { Industry } from '@/payload-types'

const initialState: AccountActionState = {}

export function NewStartupForm({ industries }: { industries: Industry[] }) {
  const [state, action, pending] = useActionState(createStartupAction, initialState)
  const [logoId, setLogoId] = useState<number | undefined>()
  const [uploadError, setUploadError] = useState<string>()
  const [uploading, setUploading] = useState(false)

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(undefined)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', 'Startup logo')

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
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}
      {logoId ? <input type="hidden" name="logoId" value={logoId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Startup name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
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
            defaultValue=""
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
          <Input id="website" name="website" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          ['isHiring', 'Hiring'],
          ['isRaising', 'Raising'],
          ['isLookingForCoFounder', 'Looking for co-founder'],
          ['womenLed', 'Women-led'],
        ].map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-sm text-brand-white/80">
            <input type="checkbox" name={name} className="accent-brand-yellow" />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? 'Creating…' : 'Create startup'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/account/startups">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
