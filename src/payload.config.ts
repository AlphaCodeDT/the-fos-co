import 'dotenv/config'

import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { collections } from '@/collections'
import { Users } from '@/collections/Users'
import { createPgDriver, createPostgresPoolConfig } from '@/lib/db-pool'
import { createS3StoragePlugin } from '@/lib/storage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: createPostgresPoolConfig(),
    pg: createPgDriver(),
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  plugins: [createS3StoragePlugin()],
  sharp,
})
