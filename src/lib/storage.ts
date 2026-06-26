import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

/**
 * Isolated S3-compatible storage configuration.
 * Switch providers (Supabase Storage, Cloudflare R2, AWS S3) via env vars only.
 */
export function createS3StoragePlugin(): Plugin {
  const bucket = process.env.S3_BUCKET
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  const enabled = Boolean(bucket && accessKeyId && secretAccessKey)

  return s3Storage({
    enabled,
    collections: {
      media: true,
    },
    bucket: bucket || 'media',
    config: {
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      region: process.env.S3_REGION || 'auto',
      ...(process.env.S3_ENDPOINT
        ? {
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
          }
        : {}),
    },
  })
}
