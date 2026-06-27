import type { CollectionSlug, Payload, Where } from 'payload'
import slugify from 'slugify'

export function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true })
}

export async function ensureUniqueSlug({
  payload,
  collection,
  baseSlug,
  excludeId,
}: {
  payload: Payload
  collection: CollectionSlug
  baseSlug: string
  excludeId?: number | string
}): Promise<string> {
  const normalized = slugify(baseSlug, { lower: true, strict: true }) || 'profile'
  let candidate = normalized
  let suffix = 2

  while (true) {
    const where: Where = excludeId
      ? {
          and: [{ slug: { equals: candidate } }, { id: { not_equals: excludeId } }],
        }
      : { slug: { equals: candidate } }

    const existing = await payload.find({
      collection,
      where,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length === 0) {
      return candidate
    }

    candidate = `${normalized}-${suffix}`
    suffix += 1
  }
}
