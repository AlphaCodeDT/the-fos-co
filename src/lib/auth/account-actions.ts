'use server'

import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { getCurrentFounder } from '@/lib/auth/founder'
import { plainTextToLexical } from '@/lib/richtext'
import { getPayloadClient } from '@/lib/payload'
import type { Founder, Startup } from '@/payload-types'
import type { Payload } from 'payload'

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

function parseOptionalMediaId(formData: FormData, key: string): number | undefined {
  const raw = formData.get(key)
  if (raw == null || raw === '') return undefined
  const id = Number(raw)
  return !Number.isNaN(id) && id > 0 ? id : undefined
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

function parseTeamRows(formData: FormData): Startup['team'] {
  const rows: NonNullable<Startup['team']> = []

  for (let index = 0; index < 50; index += 1) {
    const role = formData.get(`team[${index}].role`)
    const founderRaw = formData.get(`team[${index}].founder`)

    if (!role && !founderRaw) {
      if (index > 0) break
      continue
    }

    const founder = Number(founderRaw)
    if (!role || Number.isNaN(founder) || founder <= 0) continue

    rows.push({
      founder,
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
  const linkedIn = String(formData.get('linkedIn') || '').trim()
  const twitter = String(formData.get('twitter') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const gender = parseOptionalString(formData, 'gender')
  const avatarId = parseOptionalMediaId(formData, 'avatarId')

  const data: Partial<Founder> = {
    name,
    headline: headline || undefined,
    bio: bioText ? (plainTextToLexical(bioText) as Founder['bio']) : undefined,
    city: city || undefined,
    state: state || undefined,
    country: country || undefined,
    linkedIn: linkedIn || undefined,
    twitter: twitter || undefined,
    website: website || undefined,
    gender: gender as Founder['gender'],
    industries: parseIdList(formData, 'industries'),
    organizations: parseIdList(formData, 'organizations'),
    lookingForCoFounder: formData.get('lookingForCoFounder') === 'on',
    openToOpportunities: formData.get('openToOpportunities') === 'on',
  }

  if (avatarId) {
    data.avatar = avatarId
  }

  return data
}

function buildStartupData(formData: FormData): Partial<Startup> {
  const name = String(formData.get('name') || '').trim()
  const tagline = String(formData.get('tagline') || '').trim()
  const descriptionText = String(formData.get('description') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const industry = Number(formData.get('industry'))
  const stage = parseOptionalString(formData, 'stage')
  const fundingStatus = parseOptionalString(formData, 'fundingStatus')
  const teamSize = parseOptionalNumber(formData, 'teamSize')
  const foundedYear = parseOptionalNumber(formData, 'foundedYear')
  const logoId = parseOptionalMediaId(formData, 'logoId')

  const data: Partial<Startup> = {
    name,
    tagline: tagline || undefined,
    description: descriptionText
      ? (plainTextToLexical(descriptionText) as Startup['description'])
      : undefined,
    website: website || undefined,
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

  if (logoId) {
    data.logo = logoId
  }

  return data
}

async function fileToPlainBuffer(file: File): Promise<Buffer> {
  const ab = await file.arrayBuffer()
  const copy = new ArrayBuffer(ab.byteLength)
  new Uint8Array(copy).set(new Uint8Array(ab))
  return Buffer.from(copy)
}

async function uploadFounderMedia({
  payload,
  founder,
  file,
  alt,
}: {
  payload: Payload
  founder: Founder
  file: File
  alt: string
}): Promise<number> {
  const user = founderAuthUser(founder)
  const mediaData = {
    alt: alt || file.name,
    uploadedBy: founder.id,
  }
  const fileMeta = {
    name: file.name,
    mimetype: file.type,
    size: file.size,
  }

  try {
    const data = await fileToPlainBuffer(file)
    const media = await payload.create({
      collection: 'media',
      data: mediaData,
      file: { ...fileMeta, data },
      overrideAccess: false,
      user,
    })
    return media.id
  } catch {
    const data = await fileToPlainBuffer(file)
    const ext = path.extname(file.name) || '.bin'
    const tmpPath = path.join(os.tmpdir(), `fos-upload-${randomUUID()}${ext}`)

    try {
      await fs.writeFile(tmpPath, data)
      const media = await payload.create({
        collection: 'media',
        data: mediaData,
        filePath: tmpPath,
        overrideAccess: false,
        user,
      })
      return media.id
    } finally {
      await fs.unlink(tmpPath).catch(() => undefined)
    }
  }
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

export async function uploadMediaAction(formData: FormData): Promise<{ error?: string; id?: number }> {
  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in.' }
  }

  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Please choose an image file.' }
  }

  const alt = String(formData.get('alt') || founder.name || 'Uploaded image').trim()

  try {
    const payload = await getPayloadClient()
    const id = await uploadFounderMedia({ payload, founder, file, alt })
    return { id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
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
