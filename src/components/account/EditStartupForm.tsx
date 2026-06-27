'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import { FormMessage } from '@/components/account/AccountShell'
import { ImageUploadField } from '@/components/account/ImageUploadField'
import { StartupFormFields } from '@/components/account/StartupFormFields'
import { Button } from '@/components/ui/button'
import { updateStartupAction, type AccountActionState } from '@/lib/auth/account-actions'
import { uploadImageDirect } from '@/lib/auth/direct-upload'
import { resolveStartupLogoUrl } from '@/lib/media-image'
import type { Industry, Organization, Startup } from '@/payload-types'

const initialState: AccountActionState = {}

export function EditStartupForm({
  startup,
  industries,
  organizations,
  currentFounderId,
}: {
  startup: Startup
  industries: Industry[]
  organizations: Organization[]
  currentFounderId: number
}) {
  const [state, formAction, pending] = useActionState(updateStartupAction, initialState)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string>()
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUploadError(undefined)

    const form = event.currentTarget
    const formData = new FormData(form)

    if (pendingFile) {
      setUploading(true)
      const result = await uploadImageDirect(pendingFile, 'logo')
      setUploading(false)

      if (result.error) {
        setUploadError(result.error)
        return
      }

      if (result.publicUrl) {
        formData.set('logoUrl', result.publicUrl)
      }
    }

    formAction(formData)
  }

  const initialLogoUrl = resolveStartupLogoUrl(startup)

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6"
    >
      <input type="hidden" name="startupId" value={startup.id} />
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}
      {uploading ? (
        <p className="text-sm text-brand-white/70" role="status">
          Uploading image…
        </p>
      ) : null}

      <ImageUploadField
        id="logo"
        label="Logo"
        shape="square"
        initialUrl={initialLogoUrl}
        onFileSelect={setPendingFile}
      />

      <StartupFormFields
        startup={startup}
        industries={industries}
        organizations={organizations}
        currentFounderId={currentFounderId}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || uploading}>
          {uploading ? 'Uploading…' : pending ? 'Saving…' : 'Save startup'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/account/startups">Back</Link>
        </Button>
      </div>
    </form>
  )
}
