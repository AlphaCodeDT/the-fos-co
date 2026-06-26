import 'dotenv/config'

import type { Story } from '../src/payload-types'

import { getPayloadClient } from '../src/lib/payload'

function richText(paragraphs: string[]): Story['content'] {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
    },
  }
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run the seed script.')
  }

  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is required to run the seed script.')
  }

  const payload = await getPayloadClient()

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme123'
  const adminName = process.env.SEED_ADMIN_NAME || 'Platform Admin'

  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
  })

  let adminId: number

  if (existingAdmin.docs[0]) {
    adminId = existingAdmin.docs[0].id
    console.log(`Admin user already exists: ${adminEmail}`)
  } else {
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        slug: 'platform-admin',
        role: 'admin',
        bio: 'Editorial lead for the NSRCEL Founder Directory.',
      },
    })
    adminId = admin.id
    console.log(`Created admin user: ${adminEmail}`)
  }

  const orgData = [
    {
      name: 'IIM Bangalore',
      slug: 'iim-bangalore',
      type: 'university' as const,
      location: 'Bengaluru, India',
      website: 'https://www.iimb.ac.in',
    },
    {
      name: 'NSRCEL',
      slug: 'nsrcel',
      type: 'incubator' as const,
      location: 'Bengaluru, India',
      website: 'https://www.nsrcel.org',
    },
  ]

  const organizationIds: Record<string, number> = {}

  for (const org of orgData) {
    const existing = await payload.find({
      collection: 'organizations',
      where: { slug: { equals: org.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      organizationIds[org.slug] = existing.docs[0].id
      console.log(`Organization exists: ${org.name}`)
    } else {
      const created = await payload.create({
        collection: 'organizations',
        data: org,
      })
      organizationIds[org.slug] = created.id
      console.log(`Created organization: ${org.name}`)
    }
  }

  const nsrcel = await payload.findByID({
    collection: 'organizations',
    id: organizationIds.nsrcel,
  })

  await payload.update({
    collection: 'organizations',
    id: organizationIds.nsrcel,
    data: {
      parentOrganization: organizationIds['iim-bangalore'],
    },
  })

  console.log(`Linked ${nsrcel.name} → IIM Bangalore`)

  const categoryData = [
    { name: 'Founder Journey', slug: 'founder-journey', description: 'Personal stories from builders.' },
    { name: 'Startup News', slug: 'startup-news', description: 'Ecosystem updates and announcements.' },
    { name: 'Interviews', slug: 'interviews', description: 'Conversations with founders and operators.' },
  ]

  const categoryIds: Record<string, number> = {}

  for (const category of categoryData) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      categoryIds[category.slug] = existing.docs[0].id
    } else {
      const created = await payload.create({ collection: 'categories', data: category })
      categoryIds[category.slug] = created.id
      console.log(`Created category: ${category.name}`)
    }
  }

  const tagData = [
    { name: 'NSRCEL', slug: 'nsrcel' },
    { name: 'Bengaluru', slug: 'bengaluru' },
    { name: 'Fundraising', slug: 'fundraising' },
    { name: 'Product', slug: 'product' },
  ]

  const tagIds: number[] = []

  for (const tag of tagData) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      tagIds.push(existing.docs[0].id)
    } else {
      const created = await payload.create({ collection: 'tags', data: tag })
      tagIds.push(created.id)
      console.log(`Created tag: ${tag.name}`)
    }
  }

  const stories = [
    {
      title: 'Building in public from NSRCEL',
      slug: 'building-in-public-from-nsrcel',
      excerpt:
        'How early-stage founders at NSRCEL use community, mentorship, and relentless iteration to find product-market fit.',
      category: categoryIds['founder-journey'],
      tags: [tagIds[0], tagIds[1]],
      publishedDate: new Date('2025-11-12T10:00:00.000Z').toISOString(),
      content: richText([
        'The best founder stories rarely start with certainty. They start with a problem worth solving and a willingness to learn in public.',
        'At NSRCEL, founders balance customer discovery with ecosystem support — mentors, peers, and programs that reward momentum over polish.',
      ]),
    },
    {
      title: 'Startup news: ecosystem grants expand for student founders',
      slug: 'ecosystem-grants-expand-for-student-founders',
      excerpt:
        'University-linked incubators are widening non-dilutive support for student-led startups across India.',
      category: categoryIds['startup-news'],
      tags: [tagIds[1], tagIds[2]],
      publishedDate: new Date('2025-12-01T09:30:00.000Z').toISOString(),
      content: richText([
        'Student founders are gaining access to larger grant pools and structured incubation tracks.',
        'The shift reflects growing confidence in campus-born startups that can scale with the right ecosystem scaffolding.',
      ]),
    },
    {
      title: 'Interview: shipping an MVP in eight weeks',
      slug: 'interview-shipping-an-mvp-in-eight-weeks',
      excerpt:
        'A candid conversation on scope discipline, user interviews, and saying no while moving fast.',
      category: categoryIds.interviews,
      tags: [tagIds[3], tagIds[1]],
      publishedDate: new Date('2026-01-18T08:00:00.000Z').toISOString(),
      content: richText([
        'We sat down with a founder who went from idea to paying pilot customers in two months.',
        'Their advice: narrow the wedge, talk to users every day, and treat every release as a learning event.',
      ]),
    },
  ]

  for (const story of stories) {
    const existing = await payload.find({
      collection: 'stories',
      where: { slug: { equals: story.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      console.log(`Story exists: ${story.title}`)
      continue
    }

    await payload.create({
      collection: 'stories',
      data: {
        ...story,
        author: adminId,
        _status: 'published',
      },
      draft: false,
    })

    console.log(`Created story: ${story.title}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
