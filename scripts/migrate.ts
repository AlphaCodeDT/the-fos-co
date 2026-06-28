import 'dotenv/config'

import { execSync } from 'node:child_process'

import { applyMigrationDatabaseUrl } from '../src/lib/migration-database-url'

applyMigrationDatabaseUrl()

execSync('payload migrate', {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS || '--no-deprecation',
  },
})
