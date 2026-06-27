'use server'

import { getCurrentFounder } from '@/lib/auth/founder'
import { plainTextToLexical } from '@/lib/richtext'
import { getPayloadClient } from '@/lib/payload'
import type { Founder, Startup } from '@/payload-types'

export type AccountActionState = {
  error?: string
  success?: string
}

function parseIdList(formData: FormData, key: string): number[] {
  return formData
    .getAll(key)
    .map((value) => Number(value))
    .filter((id) => !Number.isNaN(id))
}

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const founder = await getCurrentFounder()

  if (!founder) {
    return { error: 'You must be signed in.' }
  }

  const name = String(formData.get('name') || '').trim()
  const headline = String(formData.get('headline') || '').trim()
  const bioText = String(formData.get('bio') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const linkedIn = String(formData.get('linkedIn') || '').trim()
  const twitter = String(formData.get('twitter') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const avatarId = Number(formData.get('avatarId'))
  const industries = parseIdList(formData, 'industries')
  const organizations = parseIdList(formData, 'organizations')

  if (!name) {
    return { error: 'Name is required.' }
  }

  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: 'founders',
      id: founder.id,
      data: {
        name,
        headline: headline || undefined,
        bio: bioText ? (plainTextToLexical(bioText) as Founder['bio']) : undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        linkedIn: linkedIn || undefined,
        twitter: twitter || undefined,
        website: website || undefined,
        avatar: !Number.isNaN(avatarId) && avatarId > 0 ? avatarId : undefined,
        industries,
        organizations,
        lookingForCoFounder: formData.get('lookingForCoFounder') === 'on',
        openToOpportunities: formData.get('openToOpportunities') === 'on',
      },
      user: { id: founder.id, collection: 'founders', email: founder.email } as never,
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
    const buffer = Buffer.from(await file.arrayBuffer())

    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
      user: { id: founder.id, collection: 'founders', email: founder.email } as never,
    })

    return { id: media.id }
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

  const name = String(formData.get('name') || '').trim()
  const tagline = String(formData.get('tagline') || '').trim()
  const descriptionText = String(formData.get('description') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const industry = Number(formData.get('industry'))
  const logoId = Number(formData.get('logoId'))

  if (!name) {
    return { error: 'Startup name is required.' }
  }

  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: 'startups',
      data: {
        name,
        tagline: tagline || undefined,
        description: descriptionText
          ? (plainTextToLexical(descriptionText) as Startup['description'])
          : undefined,
        website: website || undefined,
        city: city || undefined,
        country: country || undefined,
        industry: !Number.isNaN(industry) && industry > 0 ? industry : undefined,
        logo: !Number.isNaN(logoId) && logoId > 0 ? logoId : undefined,
        isHiring: formData.get('isHiring') === 'on',
        isRaising: formData.get('isRaising') === 'on',
        isLookingForCoFounder: formData.get('isLookingForCoFounder') === 'on',
        womenLed: formData.get('womenLed') === 'on',
      } as never,
      user: { id: founder.id, collection: 'founders', email: founder.email } as never,
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

  const name = String(formData.get('name') || '').trim()
  const tagline = String(formData.get('tagline') || '').trim()
  const descriptionText = String(formData.get('description') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const country = String(formData.get('country') || '').trim()
  const industry = Number(formData.get('industry'))
  const logoId = Number(formData.get('logoId'))

  if (!name) {
    return { error: 'Startup name is required.' }
  }

  try {
    const payload = await getPayloadClient()

    const existing = await payload.find({
      collection: 'startups',
      where: {
        and: [{ id: { equals: startupId } }, { owner: { equals: founder.id } }],
      },
      limit: 1,
      user: { id: founder.id, collection: 'founders', email: founder.email } as never,
    })

    if (!existing.docs[0]) {
      return { error: 'You do not have permission to edit this startup.' }
    }

    await payload.update({
      collection: 'startups',
      id: startupId,
      data: {
        name,
        tagline: tagline || undefined,
        description: descriptionText
          ? (plainTextToLexical(descriptionText) as Startup['description'])
          : undefined,
        website: website || undefined,
        city: city || undefined,
        country: country || undefined,
        industry: !Number.isNaN(industry) && industry > 0 ? industry : undefined,
        logo: !Number.isNaN(logoId) && logoId > 0 ? logoId : undefined,
        isHiring: formData.get('isHiring') === 'on',
        isRaising: formData.get('isRaising') === 'on',
        isLookingForCoFounder: formData.get('isLookingForCoFounder') === 'on',
        womenLed: formData.get('womenLed') === 'on',
      },
      user: { id: founder.id, collection: 'founders', email: founder.email } as never,
    })

    return { success: 'Startup updated. Changes may be reviewed before going live.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update startup.'
    return { error: message }
  }
}
