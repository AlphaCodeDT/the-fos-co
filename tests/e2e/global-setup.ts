import 'dotenv/config'

import dotenv from 'dotenv'

import { randomBytes } from 'crypto'

import {
  createE2eClaimableStartup,
  createE2eFounder,
  createE2eOrganization,
  createE2eOrgLinkedStartup,
  getBootstrapPayload,
  getFirstIndustryId,
  linkFounderToOrganizations,
} from './lib/payload-bootstrap'
import { writeRunState, readRunState } from './lib/run-state'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

async function cleanupStaleRunState(): Promise<void> {
  const stale = readRunState()
  if (!stale) return

  console.warn(`[e2e] Found stale run state (${stale.token}); cleaning up before bootstrap.`)
  const teardown = (await import('./global-teardown')).default
  await teardown()
}

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_ALLOW_PROD !== 'true') {
    throw new Error('Refusing to run E2E against prod without E2E_ALLOW_PROD=true')
  }

  await cleanupStaleRunState()

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for E2E global setup.')
  }

  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is required for E2E global setup.')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY must be set in .env for E2E (avatar/logo uploads and storage teardown).',
    )
  }

  const token = process.env.E2E_RUN_TOKEN
  if (!token) {
    throw new Error('E2E_RUN_TOKEN is required (set by playwright.config.ts).')
  }

  const founderPassword =
    process.env.E2E_FOUNDER_PASSWORD || randomBytes(16).toString('hex')

  const payload = await getBootstrapPayload()
  const industryId = await getFirstIndustryId(payload)

  const primaryFounder = await createE2eFounder({
    payload,
    token,
    role: 'founder',
    label: 'Founder',
    password: founderPassword,
    approve: false,
  })

  const secondaryFounder = await createE2eFounder({
    payload,
    token,
    role: 'founder2',
    label: 'Founder2',
    password: founderPassword,
    approve: true,
  })

  const claimableStartup = await createE2eClaimableStartup({
    payload,
    token,
    label: 'Claimable',
    industryId,
  })

  const publishedOrg = await createE2eOrganization({
    payload,
    token,
    label: 'Org',
    status: 'published',
  })

  const draftOrg = await createE2eOrganization({
    payload,
    token,
    label: 'Draft',
    status: 'draft',
  })

  await linkFounderToOrganizations({
    payload,
    founderId: primaryFounder.id,
    organizationIds: [publishedOrg.id],
    approve: true,
  })

  const orgLinkedStartup = await createE2eOrgLinkedStartup({
    payload,
    token,
    industryId,
    organizationId: publishedOrg.id,
  })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const admin = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
      overrideAccess: true,
    })

    if (!admin.docs[0]) {
      console.warn(`[e2e] ADMIN_EMAIL=${adminEmail} not found; admin.spec will be skipped.`)
    }
  } else {
    console.warn('[e2e] ADMIN_EMAIL not set; admin.spec will be skipped.')
  }

  writeRunState({
    token,
    founderPassword,
    founders: {
      primary: primaryFounder.id,
      secondary: secondaryFounder.id,
    },
    startups: {
      claimable: claimableStartup.id,
      orgLinked: orgLinkedStartup.id,
    },
    organizations: {
      published: publishedOrg.id,
      draft: draftOrg.id,
    },
    createdIds: {
      founders: [],
      startups: [],
      organizations: [],
      media: [],
    },
    storagePrefix: `e2e/${token}`,
  })

  console.log(`[e2e] Bootstrapped run ${token}`)
}
