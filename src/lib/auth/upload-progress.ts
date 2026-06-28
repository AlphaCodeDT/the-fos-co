import { getSupabaseAnonKey } from '@/lib/supabase/env'

export function uploadImageWithProgress(
  file: File,
  signedUrl: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  const apiKey = getSupabaseAnonKey()

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('content-type', file.type)
    xhr.setRequestHeader('apikey', apiKey)
    xhr.setRequestHeader('authorization', `Bearer ${apiKey}`)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      reject(new Error(`Upload failed: ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Upload network error'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = 60_000
    xhr.send(file)
  })
}
