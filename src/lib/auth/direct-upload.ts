'use client'

import { createSignedUpload, type SignedUploadKind } from '@/lib/auth/upload-actions'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export async function uploadImageDirect(
  file: File,
  kind: SignedUploadKind,
): Promise<{ publicUrl?: string; error?: string }> {
  const signed = await createSignedUpload({
    kind,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
  })

  if ('error' in signed && signed.error) {
    return { error: signed.error }
  }

  if (!('path' in signed) || !signed.path || !signed.token) {
    return { error: 'Could not prepare upload.' }
  }

  const supabase = createSupabaseBrowserClient()
  const { error: uploadError } = await supabase.storage
    .from('media')
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data } = supabase.storage.from('media').getPublicUrl(signed.path)
  return { publicUrl: data.publicUrl }
}
