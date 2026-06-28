import 'dotenv/config'

import dotenv from 'dotenv'
import { unlinkSync } from 'fs'

import { createSupabaseServiceClient } from '../../src/lib/supabase/server'
import type { Founder, Organization, Program, Startup } from '../../src/payload-types'

import {
  assertDeleteBatch,
  assertE2eFounder,
  assertE2eOrganization,
  assertE2eProgram,
  assertE2eStartup,
} from './lib/guards'
import { auditNoLeftoverE2eRows, getBootstrapPayload } from './lib/payload-bootstrap'
import { collectAllIds, readRunState, RUN_STATE_PATH } from './lib/run-state'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

async function listAllStoragePaths(prefix: string): Promise<string[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[e2e] SUPABASE_SERVICE_ROLE_KEY not set; skipping storage cleanup.')
    return []
  }

  const supabase = createSupabaseServiceClient()
  const paths: string[] = []

  async function walk(currentPrefix: string): Promise<void> {
    const { data, error } = await supabase.storage.from('media').list(currentPrefix, {
      limit: 1000,
    })

    if (error || !data) return

    for (const item of data) {
      const itemPath = `${currentPrefix}/${item.name}`
      if (item.id) {
        paths.push(itemPath)
      } else {
        await walk(itemPath)
      }
    }
  }

  await walk(prefix)
  return paths
}

export default async function globalTeardown(): Promise<void> {
  const state = readRunState()
  if (!state) {
    console.warn('[e2e] No run state found; skipping teardown.')
    return
  }

  const { token } = state
  const ids = collectAllIds(state)

  assertDeleteBatch(ids.startups, 'startup')
  assertDeleteBatch(ids.founders, 'founder')
  if (ids.programs.length > 0) {
    assertDeleteBatch(ids.programs, 'program')
  }
  if (ids.organizations.length > 0) {
    assertDeleteBatch(ids.organizations, 'organization')
  }

  const payload = await getBootstrapPayload()

  for (const startupId of ids.startups) {
    let doc: Startup
    try {
      doc = (await payload.findByID({
        collection: 'startups',
        id: startupId,
        overrideAccess: true,
      })) as Startup
    } catch {
      console.warn(`[e2e] Startup ${startupId} not found during teardown; skipping.`)
      continue
    }

    assertE2eStartup(doc, token)

    await payload.delete({
      collection: 'startups',
      id: startupId,
      overrideAccess: true,
    })
  }

  if (ids.media.length > 0) {
    for (const mediaId of ids.media) {
      await payload.delete({
        collection: 'media',
        id: mediaId,
        overrideAccess: true,
      })
    }
  }

  for (const founderId of ids.founders) {
    let doc: Founder
    try {
      doc = (await payload.findByID({
        collection: 'founders',
        id: founderId,
        overrideAccess: true,
      })) as Founder
    } catch {
      console.warn(`[e2e] Founder ${founderId} not found during teardown; skipping.`)
      continue
    }

    assertE2eFounder(doc, token)

    await payload.delete({
      collection: 'founders',
      id: founderId,
      overrideAccess: true,
    })
  }

  for (const programId of ids.programs) {
    let doc: Program
    try {
      doc = (await payload.findByID({
        collection: 'programs',
        id: programId,
        overrideAccess: true,
      })) as Program
    } catch {
      console.warn(`[e2e] Program ${programId} not found during teardown; skipping.`)
      continue
    }

    assertE2eProgram(doc, token)

    await payload.delete({
      collection: 'programs',
      id: programId,
      overrideAccess: true,
    })
  }

  for (const organizationId of ids.organizations) {
    let doc: Organization
    try {
      doc = (await payload.findByID({
        collection: 'organizations',
        id: organizationId,
        overrideAccess: true,
      })) as Organization
    } catch {
      console.warn(`[e2e] Organization ${organizationId} not found during teardown; skipping.`)
      continue
    }

    assertE2eOrganization(doc, token)

    await payload.delete({
      collection: 'organizations',
      id: organizationId,
      overrideAccess: true,
    })
  }

  const storagePrefix = state.storagePrefix || `e2e/${token}`
  const storagePaths = await listAllStoragePaths(storagePrefix)

  if (storagePaths.length > 0) {
    if (storagePaths.length > 50) {
      throw new Error(`Refusing storage bulk delete of ${storagePaths.length} files (>50).`)
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[e2e] SUPABASE_SERVICE_ROLE_KEY not set; skipping storage object removal.')
    } else {
      const supabase = createSupabaseServiceClient()
      const { error } = await supabase.storage.from('media').remove(storagePaths)
      if (error) {
        console.error('[e2e] Storage cleanup error:', error.message)
      } else {
        console.log(`[e2e] Removed ${storagePaths.length} storage object(s) under ${storagePrefix}`)
      }
    }
  }

  await auditNoLeftoverE2eRows(payload, token)

  try {
    unlinkSync(RUN_STATE_PATH)
  } catch {
    // ignore
  }
}
