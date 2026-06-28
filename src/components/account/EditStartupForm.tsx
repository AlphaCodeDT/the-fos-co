'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { AccountSubmitButton } from '@/components/account/AccountSubmitButton'
import { FormMessage } from '@/components/account/AccountShell'
import { ImageSubmitProgress } from '@/components/account/ImageSubmitProgress'
import { ImageUploadField } from '@/components/account/ImageUploadField'
import { useImageFormSubmit } from '@/components/account/useImageFormSubmit'
import { StartupFormFields } from '@/components/account/StartupFormFields'
import { Button } from '@/components/ui/button'
import { updateStartupAction, type AccountActionState } from '@/lib/auth/account-actions'
import { resolveStartupLogoUrl } from '@/lib/media-image'
import type { Founder, Industry, Startup } from '@/payload-types'

const initialState: AccountActionState = {}

export function EditStartupForm({
  startup,
  industries,
  currentFounder,
}: {
  startup: Startup
  industries: Industry[]
  currentFounder: Pick<
    Founder,
    'id' | 'name' | 'slug' | 'headline' | 'avatarUrl' | 'city'
  > & { avatar?: Founder['avatar'] }
}) {
  const [state, formAction, pending] = useActionState(updateStartupAction, initialState)
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

  const initialLogoUrl = resolveStartupLogoUrl(startup)

  const pendingLabel = phase === 'uploading' ? 'Uploading…' : 'Saving…'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6"
    >
      <input type="hidden" name="startupId" value={startup.id} />
      <FormMessage {...state} />
      {uploadError ? <FormMessage error={uploadError} /> : null}

      <ImageUploadField
        id="logo"
        label="Logo"
        shape="square"
        initialUrl={initialLogoUrl}
        onFileSelect={setPendingFile}
      />

      <StartupFormFields startup={startup} industries={industries} currentFounder={currentFounder} />

      <div className="space-y-3">
        <ImageSubmitProgress
          phase={phase}
          uploadPercent={uploadPercent}
          uploadIndeterminate={uploadIndeterminate}
        />
        <div className="flex gap-3">
          <AccountSubmitButton
            pending={isBusy}
            idleLabel="Save startup"
            pendingLabel={pendingLabel}
          />
          <Button asChild variant="outline">
            <Link href="/account/startups">Back</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
