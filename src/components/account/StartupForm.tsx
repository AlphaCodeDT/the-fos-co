'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { FormMessage } from '@/components/account/AccountShell'
import { ImageSubmitProgress } from '@/components/account/ImageSubmitProgress'
import { ImageUploadField } from '@/components/account/ImageUploadField'
import { useImageFormSubmit } from '@/components/account/useImageFormSubmit'
import { StartupFormFields } from '@/components/account/StartupFormFields'
import { Button } from '@/components/ui/button'
import { createStartupAction, type AccountActionState } from '@/lib/auth/account-actions'
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
  const [state, formAction, pending] = useActionState(createStartupAction, initialState)
  const {
    setPendingFile,
    phase,
    uploadPercent,
    uploadIndeterminate,
    uploadError,
    handleSubmit,
    isBusy,
  } = useImageFormSubmit({
    kind: 'logo',
    urlFieldName: 'logoUrl',
    formAction,
    pending,
    actionState: state,
  })

  const submitLabel =
    phase === 'uploading'
      ? 'Uploading…'
      : phase === 'saving' || pending
        ? 'Creating…'
        : 'Create startup'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6"
    >
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}

      <ImageUploadField id="logo" label="Logo" shape="square" onFileSelect={setPendingFile} />

      <StartupFormFields
        industries={industries}
        organizations={organizations}
        currentFounderId={currentFounderId}
      />

      <div className="space-y-3">
        <ImageSubmitProgress
          phase={phase}
          uploadPercent={uploadPercent}
          uploadIndeterminate={uploadIndeterminate}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={isBusy}>
            {submitLabel}
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/startups">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
