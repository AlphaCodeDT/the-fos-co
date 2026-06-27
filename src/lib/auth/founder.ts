import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import type { Founder } from '@/payload-types'

export async function getCurrentFounder(): Promise<Founder | null> {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || user.collection !== 'founders') {
    return null
  }

  try {
    return (await payload.findByID({
      collection: 'founders',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })) as Founder
  } catch {
    return null
  }
}

export async function requireFounder(): Promise<Founder> {
  const founder = await getCurrentFounder()

  if (!founder) {
    redirect('/login')
  }

  return founder
}

export async function getAuthUser() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user
}
