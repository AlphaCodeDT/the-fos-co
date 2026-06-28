'use client'

import { Progress } from '@/components/ui/progress'

export type ImageSubmitPhase = 'idle' | 'uploading' | 'saving' | 'done'

type ImageSubmitProgressProps = {
  phase: ImageSubmitPhase
  uploadPercent: number
  uploadIndeterminate: boolean
}

export function ImageSubmitProgress({
  phase,
  uploadPercent,
  uploadIndeterminate,
}: ImageSubmitProgressProps) {
  if (phase === 'idle') {
    return null
  }

  if (phase === 'done') {
    return (
      <p className="text-sm font-medium text-brand-yellow" role="status" aria-live="polite">
        Saved
      </p>
    )
  }

  const isUploading = phase === 'uploading'
  const statusLabel = isUploading
    ? uploadIndeterminate
      ? 'Uploading image…'
      : `Uploading image… ${uploadPercent}%`
    : 'Saving changes…'

  return (
    <div className="space-y-2">
      <p className="text-sm text-brand-white/70" role="status" aria-live="polite">
        {statusLabel}
      </p>
      <Progress
        value={isUploading && !uploadIndeterminate ? uploadPercent : undefined}
        indeterminate={!isUploading || uploadIndeterminate}
      />
    </div>
  )
}
