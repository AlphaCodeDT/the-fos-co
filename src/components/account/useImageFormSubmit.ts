'use client'

import { useEffect, useState } from 'react'

import type { ImageSubmitPhase } from '@/components/account/ImageSubmitProgress'
import type { AccountActionState } from '@/lib/auth/account-actions'
import { uploadImageDirect } from '@/lib/auth/direct-upload'
import type { SignedUploadKind } from '@/lib/auth/upload-actions'

type UseImageFormSubmitOptions = {
  kind: SignedUploadKind
  urlFieldName: 'avatarUrl' | 'logoUrl'
  formAction: (formData: FormData) => void
  pending: boolean
  actionState: AccountActionState
}

export function useImageFormSubmit({
  kind,
  urlFieldName,
  formAction,
  pending,
  actionState,
}: UseImageFormSubmitOptions) {
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<ImageSubmitPhase>('idle')
  const [uploadPercent, setUploadPercent] = useState(0)
  const [uploadIndeterminate, setUploadIndeterminate] = useState(false)
  const [uploadError, setUploadError] = useState<string>()

  useEffect(() => {
    if (!actionState.success || phase !== 'saving') {
      return
    }

    setPhase('done')
    const timer = window.setTimeout(() => {
      setPhase('idle')
      setUploadPercent(0)
      setUploadIndeterminate(false)
      setPendingFile(null)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [actionState.success, phase])

  useEffect(() => {
    if (actionState.error && phase === 'saving') {
      setPhase('idle')
      setUploadIndeterminate(false)
    }
  }, [actionState.error, phase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUploadError(undefined)

    const form = event.currentTarget
    const formData = new FormData(form)

    if (pendingFile) {
      setPhase('uploading')
      setUploadPercent(0)
      setUploadIndeterminate(false)

      const result = await uploadImageDirect(pendingFile, kind, (percent) => {
        if (percent === null) {
          setUploadIndeterminate(true)
          return
        }
        setUploadIndeterminate(false)
        setUploadPercent(percent)
      })

      if (result.error) {
        setPhase('idle')
        setUploadError(result.error)
        return
      }

      if (result.publicUrl) {
        formData.set(urlFieldName, result.publicUrl)
      }
    }

    setPhase('saving')
    setUploadIndeterminate(true)
    formAction(formData)
  }

  const isBusy = phase === 'uploading' || phase === 'saving' || pending

  return {
    pendingFile,
    setPendingFile,
    phase,
    uploadPercent,
    uploadIndeterminate,
    uploadError,
    handleSubmit,
    isBusy,
  }
}
