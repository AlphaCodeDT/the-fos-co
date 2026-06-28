'use server'

import { getCurrentFounder } from '@/lib/auth/founder'
import { searchFounders } from '@/lib/data/founder-search'
import { searchStartups } from '@/lib/data/startup-search'
import { plainTextToLexical } from '@/lib/richtext'
import { getPayloadClient } from '@/lib/payload'
import { SOCIAL_LINK_FIELDS, type SocialLinkField } from '@/lib/social-links'
import { normalizeSocialUrl } from '@/lib/social-url'
import type { Founder, Startup } from '@/payload-types'

export type AccountActionState = {
  error?: string
  success?: string
}

type FounderAuthUser = Founder & { collection: 'founders' }

type TeamRole = NonNullable<Startup['team']>[number]['role']
type OpportunityType = NonNullable<Startup['opportunities']>[number]['type']

function founderAuthUser(founder: Founder): FounderAuthUser {
  return { ...founder, collection: 'founders' }
}

function parseIdList(formData: FormData, key: string): number[] {
  return formData
    .getAll(key)
    .map((value) => Number(value))
    .filter((id) => !Number.isNaN(id))
}

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) || '').trim()
  return value || undefined
}

function parseOptionalNumber(formData: FormData, key: string): number | undefined {
  const raw = String(formData.get(key) || '').trim()
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isNaN(value) ? undefined : value
}

function parseOptionalUrl(formData: FormData, key: string): string | undefined {
  const raw = String(formData.get(key) || '').trim()
  if (!raw) return undefined
  return normalizeSocialUrl(raw)
}

function parseSocialLinks(formData: FormData): Partial<Record<SocialLinkField, string | undefined>> {
  const links: Partial<Record<SocialLinkField, string | undefined>> = {}

  for (const field of SOCIAL_LINK_FIELDS) {
    links[field] = parseOptionalUrl(formData, field)
  }

  return links
}

function parseTeamRows(formData: FormData): Startup['team'] {
  const rows: NonNullable<Startup['team']> = []

  for (let index = 0; index < 50; index += 1) {
    const role = formData.get(`team[${index}].role`)
    const founderRaw = formData.get(`team[${index}].founder`)
    const name = String(formData.get(`team[${index}].name`) || '').trim()

    if (!role && !founderRaw && !name) {
      if (index > 0) break
      continue
    }

    if (!role) continue

    const founder = founderRaw ? Number(founderRaw) : Number.NaN
    const hasFounder = !Number.isNaN(founder) && founder > 0
    const hasName = name.length > 0

    if (!hasFounder && !hasName) continue

    rows.push({
      ...(hasFounder ? { founder } : {}),
      ...(hasName && !hasFounder ? { name } : {}),
      role: String(role) as TeamRole,
      isPrimary: formData.get(`team[${index}].isPrimary`) === 'on',
    })
  }

  return rows.length > 0 ? rows : undefined
}

function parseOpportunityRows(formData: FormData): Startup['opportunities'] {
  const rows: NonNullable<Startup['opportunities']> = []

  for (let index = 0; index < 50; index += 1) {
    const type = formData.get(`opportunities[${index}].type`)
    const title = String(formData.get(`opportunities[${index}].title`) || '').trim()

    if (!type && !title) {
      if (index > 0) break
      continue
    }

    if (!type || !title) continue

    const description = String(formData.get(`opportunities[${index}].description`) || '').trim()
    const link = String(formData.get(`opportunities[${index}].link`) || '').trim()

    rows.push({
      type: String(type) as OpportunityType,
      title,
      description: description || undefined,
      link: link || undefined,
    })
  }

  return rows.length > 0 ? rows : undefined
}

function buildFounderProfileData(formData: FormData): Partial<Founder> {
  const name = String(formData.get('name') || '').trim()
  const headline = String(formData.get('headline') || '').trim()
  const bioText = String(formData.get('bio') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const gender = parseOptionalString(formData, 'gender')
  const avatarUrl = parseOptionalString(formData, 'avatarUrl')
  const socialLinks = parseSocialLinks(formData)

  const data: Partial<Founder> = {
    name,
    headline: headline || undefined,
    bio: bioText ? (plainTextToLexical(bioText) as Founder['bio']) : undefined,
    city: city || undefined,
    state: state || undefined,
    country: country || undefined,
    linkedIn: socialLinks.linkedIn,
    twitter: socialLinks.twitter,
    instagram: socialLinks.instagram,
    facebook: socialLinks.facebook,
    youtube: socialLinks.youtube,
    github: socialLinks.github,
    website: socialLinks.website,
    gender: gender as Founder['gender'],
    industries: parseIdList(formData, 'industries'),
    organizations: parseIdList(formData, 'organizations'),
    lookingForCoFounder: formData.get('lookingForCoFounder') === 'on',
    openToOpportunities: formData.get('openToOpportunities') === 'on',
  }

  if (avatarUrl) {
    data.avatarUrl = avatarUrl
  }

  return data
}

function buildStartupData(formData: FormData): Partial<Startup> {
  const name = String(formData.get('name') || '').trim()
  const tagline = String(formData.get('tagline') || '').trim()
  const descriptionText = String(formData.get('description') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const industry = Number(formData.get('industry'))
  const stage = parseOptionalString(formData, 'stage')
  const fundingStatus = parseOptionalString(formData, 'fundingStatus')
  const teamSize = parseOptionalNumber(formData, 'teamSize')
  const foundedYear = parseOptionalNumber(formData, 'foundedYear')
  const logoUrl = parseOptionalString(formData, 'logoUrl')
  const socialLinks = parseSocialLinks(formData)

  const data: Partial<Startup> = {
    name,
    tagline: tagline || undefined,
    description: descriptionText
      ? (plainTextToLexical(descriptionText) as Startup['description'])
      : undefined,
    website: socialLinks.website,
    linkedIn: socialLinks.linkedIn,
    twitter: socialLinks.twitter,
    instagram: socialLinks.instagram,
    facebook: socialLinks.facebook,
    youtube: socialLinks.youtube,
    github: socialLinks.github,
    city: city || undefined,
    state: state || undefined,
    country: country || undefined,
    industry: !Number.isNaN(industry) && industry > 0 ? industry : undefined,
    stage: stage as Startup['stage'],
    teamSize,
    fundingStatus,
    foundedYear,
    organizations: parseIdList(formData, 'organizations'),
    team: parseTeamRows(formData),
    opportunities: parseOpportunityRows(formData),
    isHiring: formData.get('isHiring') === 'on',
    isRaising: formData.get('isRaising') === 'on',
    isLookingForCoFounder: formData.get('isLookingForCoFounder') === 'on',
    womenLed: formData.get('womenLed') === 'on',
  }

  if (logoUrl) {
    data.logoUrl = logoUrl
  }

  return data
}

export async function searchFoundersAction(query: string) {
  const founder = await getCurrentFounder()

  if (!founder) {
    return []
  }

  return searchFounders(query)
}

export async function searchStartupsAction(query: string) {
  const founder = await getCurrentFounder()

  if (!founder) {
    return []
  }

  return searchStartups(query, founder.id)
}

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in.' }
  }

  const data = buildFounderProfileData(formData)

  if (!data.name) {
    return { error: 'Name is required.' }
  }

  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: 'founders',
      id: founder.id,
      data,
      user: founderAuthUser(founder),
    })

    return { success: 'Profile updated. Changes may be reviewed before going live.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update profile.'
    return { error: message }
  }
}

export async function createStartupAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in.' }
  }

  const data = buildStartupData(formData)

  if (!data.name) {
    return { error: 'Startup name is required.' }
  }

  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: 'startups',
      data: data as never,
      user: founderAuthUser(founder),
    })

    return {
      success: 'Startup created and pending review. It will appear publicly after editor approval.',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create startup.'
    return { error: message }
  }
}

export async function updateStartupAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in.' }
  }

  const startupId = Number(formData.get('startupId'))

  if (!startupId || Number.isNaN(startupId)) {
    return { error: 'Invalid startup.' }
  }

  const data = buildStartupData(formData)

  if (!data.name) {
    return { error: 'Startup name is required.' }
  }

  try {
    const payload = await getPayloadClient()
    const user = founderAuthUser(founder)

    const existing = await payload.find({
      collection: 'startups',
      where: {
        and: [{ id: { equals: startupId } }, { owner: { equals: founder.id } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (!existing.docs[0]) {
      return { error: 'You do not have permission to edit this startup.' }
    }

    await payload.update({
      collection: 'startups',
      id: startupId,
      data,
      user,
    })

    return { success: 'Startup updated. Changes may be reviewed before going live.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update startup.'
    return { error: message }
  }
}
