'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import { AccountShell, FormMessage } from '@/components/account/AccountShell'
import { StartupFormFields } from '@/components/account/StartupFormFields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createStartupAction,
  uploadMediaAction,
  type AccountActionState,
} from '@/lib/auth/account-actions'
import type { Industry, Organization } from '@/payload-types'

const initialState: AccountActionState = {}

export function NewStartupForm({
  industries,
  organizations,
  currentFounderId,
}: {
  industries: Industry[]
  organizations: Organization[]
  currentFounderId: number
}) {
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

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="logo">Logo</Label>
        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} />
      </div>

      <StartupFormFields
        industries={industries}
        organizations={organizations}
        currentFounderId={currentFounderId}
      />

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
