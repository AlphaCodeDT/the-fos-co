import 'dotenv/config'

import { execSync } from 'node:child_process'

import { applyMigrationDatabaseUrl } from '../src/lib/migration-database-url'

if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
  console.log(`Skipping migrate on VERCEL_ENV=${process.env.VERCEL_ENV} (non-production build).`)
  process.exit(0)
}

applyMigrationDatabaseUrl()

execSync('payload migrate', {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS || '--no-deprecation',
  },
})
