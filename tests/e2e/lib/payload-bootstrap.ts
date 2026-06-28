import type { Payload } from 'payload'

import { getPayloadClient } from '../../../src/lib/payload'
import type { Founder, Startup } from '../../../src/payload-types'

import {
  e2eFounderEmail,
  e2eFounderName,
  e2eStartupName,
} from './constants'
import { richText } from './rich-text'

export async function getBootstrapPayload(): Promise<Payload> {
  return getPayloadClient()
}

export async function getFirstIndustryId(payload: Payload): Promise<number> {
  const result = await payload.find({
    collection: 'industries',
    limit: 1,
    sort: 'name',
    overrideAccess: true,
  })

  const industry = result.docs[0]
  if (!industry) {
    throw new Error('No industries found in database; cannot bootstrap E2E startup.')
  }

  return industry.id
}

export async function createE2eFounder({
  payload,
  token,
  role,
  label,
  password,
  approve = false,
}: {
  payload: Payload
  token: string
  role: string
  label: string
  password: string
  approve?: boolean
}): Promise<Founder> {
  const name = e2eFounderName(token, label)
  const email = e2eFounderEmail(token, role)

  const created = (await payload.create({
    collection: 'founders',
    data: {
      name,
      email,
      password,
      headline: `E2E headline for ${label}`,
      _verified: true,
    },
    overrideAccess: true,
  })) as Founder

  if (approve) {
    return (await payload.update({
      collection: 'founders',
      id: created.id,
      data: {
        moderationStatus: 'approved',
        verificationStatus: 'verified',
      },
      overrideAccess: true,
    })) as Founder
  }

  return created
}

export async function createE2eClaimableStartup({
  payload,
  token,
  label,
  industryId,
}: {
  payload: Payload
  token: string
  label: string
  industryId: number
}): Promise<Startup> {
  const name = e2eStartupName(token, label)

  const created = (await payload.create({
    collection: 'startups',
    data: {
      name,
      tagline: 'E2E claimable startup',
      industry: industryId,
      city: 'Bengaluru',
      country: 'India',
      moderationStatus: 'approved',
      verificationStatus: 'verified',
      claim: {
        claimStatus: 'unclaimed',
      },
      description: richText(['E2E claimable startup for Playwright tests.']),
    },
    overrideAccess: true,
  })) as Startup

  return created
}

export async function createE2eRejectStartup({
  payload,
  token,
  industryId,
}: {
  payload: Payload
  token: string
  industryId: number
}): Promise<Startup> {
  return createE2eClaimableStartup({
    payload,
    token,
    label: 'Reject',
    industryId,
  })
}

export async function submitClaimForFounder({
  payload,
  startupId,
  founderId,
}: {
  payload: Payload
  startupId: number
  founderId: number
}): Promise<Startup> {
  return (await payload.update({
    collection: 'startups',
    id: startupId,
    overrideAccess: true,
    data: {
      claim: {
        claimStatus: 'pending',
        claimedBy: founderId,
        claimedAt: new Date().toISOString(),
      },
    },
  })) as Startup
}

export async function findStartupByName(
  payload: Payload,
  name: string,
): Promise<Startup | null> {
  const result = await payload.find({
    collection: 'startups',
    where: { name: { equals: name } },
    limit: 1,
    overrideAccess: true,
  })

  return (result.docs[0] as Startup | undefined) ?? null
}

export async function findFounderByEmail(
  payload: Payload,
  email: string,
): Promise<Founder | null> {
  const result = await payload.find({
    collection: 'founders',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  return (result.docs[0] as Founder | undefined) ?? null
}

export async function auditNoLeftoverE2eRows(
  payload: Payload,
  token: string,
): Promise<void> {
  const [founders, startups] = await Promise.all([
    payload.find({
      collection: 'founders',
      where: { name: { contains: token } },
      limit: 5,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'startups',
      where: { name: { contains: token } },
      limit: 5,
      overrideAccess: true,
    }),
  ])

  const leftover = founders.totalDocs + startups.totalDocs

  if (leftover > 0) {
    const names = [
      ...founders.docs.map((doc) => `founder:${(doc as Founder).name}`),
      ...startups.docs.map((doc) => `startup:${(doc as Startup).name}`),
    ]
    throw new Error(`E2E teardown audit failed: ${leftover} leftover row(s): ${names.join(', ')}`)
  }

  console.log('E2E teardown audit: 0 leftover E2E rows')
}
