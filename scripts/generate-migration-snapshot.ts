/**
 * Regenerate migration schema snapshot JSON for the latest applied migration.
 * Payload migrate:create diffs against the newest *.json snapshot, not live DB.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

import config from '../src/payload.config.ts'
import { getPayload } from 'payload'

const require = createRequire(import.meta.url)
const { generateDrizzleJson } = require('drizzle-kit/api') as {
  generateDrizzleJson: (schema: unknown) => Promise<unknown>
}

const migrationName = process.argv[2]
if (!migrationName) {
  console.error('Usage: tsx scripts/generate-migration-snapshot.ts <migration_basename>')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(__dirname, '../src/migrations')
const snapshotPath = path.join(migrationsDir, `${migrationName}.json`)

const payload = await getPayload({ config })

// @ts-expect-error - adapter schema is populated after init
const drizzleJson = await generateDrizzleJson(payload.db.schema)

fs.writeFileSync(snapshotPath, JSON.stringify(drizzleJson, null, 2) + '\n')
console.log(`Wrote schema snapshot: ${snapshotPath}`)

await payload.destroy()
process.exit(0)
