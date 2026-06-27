'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ImageUploadFieldProps = {
  id: string
  label: string
  initialUrl?: string | null
  shape?: 'circle' | 'square'
  onFileSelect: (file: File | null) => void
}

export function ImageUploadField({
  id,
  label,
  initialUrl,
  shape = 'circle',
  onFileSelect,
}: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    if (file) {
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setPreviewUrl(url)
    } else {
      setPreviewUrl(initialUrl || null)
    }

    onFileSelect(file)
  }

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {previewUrl ? (
        <div className={`relative h-20 w-20 overflow-hidden bg-brand-white/10 ${roundedClass}`}>
          <Image
            src={previewUrl}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={previewUrl.startsWith('blob:')}
          />
        </div>
      ) : null}
      <Input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleChange}
      />
    </div>
  )
}
