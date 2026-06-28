'use client'

import { createSignedUpload, type SignedUploadKind } from '@/lib/auth/upload-actions'
import { uploadImageWithProgress } from '@/lib/auth/upload-progress'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export type UploadProgressCallback = (percent: number | null) => void

async function uploadWithSignedUrlFallback(
  path: string,
  token: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<void> {
  onProgress?.(null)

  const supabase = createSupabaseBrowserClient()
  const { error } = await supabase.storage.from('media').uploadToSignedUrl(path, token, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadImageDirect(
  file: File,
  kind: SignedUploadKind,
  onProgress?: UploadProgressCallback,
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

  const { path, token, signedUrl } = signed

  try {
    if (signedUrl) {
      try {
        await uploadImageWithProgress(file, signedUrl, (percent) => onProgress?.(percent))
      } catch {
        await uploadWithSignedUrlFallback(path, token, file, onProgress)
      }
    } else {
      await uploadWithSignedUrlFallback(path, token, file, onProgress)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
    return { error: message }
  }

  const supabase = createSupabaseBrowserClient()
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { publicUrl: data.publicUrl }
}
