'use server'

import { requireFounder } from '@/lib/auth/founder'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

const ALLOWED_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
])

const MAX_BYTES = 5 * 1024 * 1024

export type SignedUploadKind = 'avatar' | 'logo'

export type SignedUploadResult =
  | { error: string }
  | { path: string; token: string; signedUrl: string }

function sanitizeUploadFileName(fileName: string): string {
  const base = fileName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
  return base.length > 0 ? base.slice(0, 120) : 'upload'
}

export async function createSignedUpload({
  kind,
  fileName,
  contentType,
  size,
}: {
  kind: SignedUploadKind
  fileName: string
  contentType: string
  size: number
}): Promise<SignedUploadResult> {
  const founder = await requireFounder()

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return { error: 'Only PNG, JPEG, WebP, and AVIF images are allowed.' }
  }

  if (size <= 0 || size > MAX_BYTES) {
    return { error: 'Image must be between 1 byte and 5 MB.' }
  }

  const safeName = sanitizeUploadFileName(fileName)
  const prefix = kind === 'avatar' ? 'founders' : 'startups'
  const path = `${prefix}/${founder.id}/${Date.now()}-${safeName}`

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.storage.from('media').createSignedUploadUrl(path)

  if (error || !data?.token || !data.signedUrl) {
    return { error: error?.message || 'Could not create upload URL.' }
  }

  return { path: data.path, token: data.token, signedUrl: data.signedUrl }
}
