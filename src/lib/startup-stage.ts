import { STARTUP_STAGE_OPTIONS } from '@/components/account/startup-form-constants'
import type { Startup } from '@/payload-types'

export function formatStartupStage(stage: Startup['stage']): string | null {
  if (!stage) return null
  return STARTUP_STAGE_OPTIONS.find((option) => option.value === stage)?.label || stage
}
