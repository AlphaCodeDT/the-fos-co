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
        bio: 'Editorial lead for Founders of Startups.',
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

  const industryData = [
    { name: 'FinTech', slug: 'fintech' },
    { name: 'HealthTech', slug: 'healthtech' },
    { name: 'SaaS', slug: 'saas' },
    { name: 'Climate', slug: 'climate' },
    { name: 'EdTech', slug: 'edtech' },
  ]

  const industryIds: Record<string, number> = {}

  for (const industry of industryData) {
    const existing = await payload.find({
      collection: 'industries',
      where: { slug: { equals: industry.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      industryIds[industry.slug] = existing.docs[0].id
      console.log(`Industry exists: ${industry.name}`)
    } else {
      const created = await payload.create({ collection: 'industries', data: industry })
      industryIds[industry.slug] = created.id
      console.log(`Created industry: ${industry.name}`)
    }
  }

  const founderData = [
    {
      name: 'Ananya Sharma',
      slug: 'ananya-sharma',
      email: 'ananya@example.com',
      password: 'founder123',
      headline: 'CEO & Co-Founder',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      linkedIn: 'https://linkedin.com/in/ananya-sharma',
      industries: [industryIds.fintech],
      organizations: [organizationIds.nsrcel],
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      bio: richText([
        'Ananya builds payments infrastructure for Indian SMBs. Previously led product at a Series B fintech.',
      ]),
    },
    {
      name: 'Rahul Menon',
      slug: 'rahul-menon',
      email: 'rahul@example.com',
      password: 'founder123',
      headline: 'Founder',
      city: 'Bengaluru',
      country: 'India',
      industries: [industryIds.healthtech],
      organizations: [organizationIds.nsrcel],
      moderationStatus: 'approved' as const,
      verificationStatus: 'pending' as const,
      bio: richText(['Rahul is building accessible diagnostics tools for tier-2 clinics.']),
    },
    {
      name: 'Priya Nair',
      slug: 'priya-nair',
      email: 'priya@example.com',
      password: 'founder123',
      headline: 'CTO & Co-Founder',
      city: 'Bengaluru',
      country: 'India',
      twitter: 'https://twitter.com/priyanair',
      industries: [industryIds.saas, industryIds.edtech],
      organizations: [organizationIds['iim-bangalore']],
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      bio: richText(['Priya engineers learning platforms used by 50k+ students across India.']),
    },
    {
      name: 'Vikram Patel',
      slug: 'vikram-patel',
      email: 'vikram@example.com',
      password: 'founder123',
      headline: 'Advisor',
      city: 'Mumbai',
      country: 'India',
      industries: [industryIds.climate],
      organizations: [organizationIds.nsrcel],
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      bio: richText(['Climate tech operator advising early teams on go-to-market and partnerships.']),
    },
    {
      name: 'Meera Iyer',
      slug: 'meera-iyer',
      email: 'meera@example.com',
      password: 'founder123',
      headline: 'CEO',
      city: 'Bengaluru',
      country: 'India',
      website: 'https://example.com/meera',
      industries: [industryIds.healthtech],
      organizations: [organizationIds.nsrcel],
      moderationStatus: 'approved' as const,
      verificationStatus: 'pending' as const,
      bio: richText(['Meera is scaling a women-led health platform connecting patients to specialists.']),
    },
  ]

  const founderIds: Record<string, number> = {}

  for (const founder of founderData) {
    const existing = await payload.find({
      collection: 'founders',
      where: { slug: { equals: founder.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      founderIds[founder.slug] = existing.docs[0].id
      console.log(`Founder exists: ${founder.name}`)
    } else {
      const created = await payload.create({
        collection: 'founders',
        data: {
          ...founder,
          _verified: true,
        },
      })
      founderIds[founder.slug] = created.id
      console.log(`Created founder: ${founder.name}`)
    }
  }

  const startupData = [
    {
      name: 'PayFlow India',
      slug: 'payflow-india',
      tagline: 'Payments for every storefront',
      industry: industryIds.fintech,
      organizations: [organizationIds.nsrcel],
      city: 'Bengaluru',
      country: 'India',
      womenLed: false,
      isHiring: true,
      isRaising: false,
      isLookingForCoFounder: false,
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      team: [{ founder: founderIds['ananya-sharma'], role: 'ceo' as const, isPrimary: true }],
      description: richText(['PayFlow helps Indian SMBs accept UPI and card payments with same-day settlement.']),
    },
    {
      name: 'ClinicBridge',
      slug: 'clinicbridge',
      tagline: 'Diagnostics made accessible',
      industry: industryIds.healthtech,
      organizations: [organizationIds.nsrcel],
      city: 'Bengaluru',
      country: 'India',
      womenLed: true,
      isHiring: false,
      isRaising: true,
      isLookingForCoFounder: true,
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      team: [
        { founder: founderIds['meera-iyer'], role: 'founder' as const, isPrimary: true },
        { founder: founderIds['rahul-menon'], role: 'co-founder' as const, isPrimary: false },
      ],
      description: richText(['ClinicBridge connects tier-2 clinics to affordable diagnostic networks.']),
    },
    {
      name: 'LearnLoop',
      slug: 'learnloop',
      tagline: 'Adaptive learning for classrooms',
      industry: industryIds.edtech,
      organizations: [organizationIds['iim-bangalore']],
      city: 'Bengaluru',
      country: 'India',
      womenLed: false,
      isHiring: true,
      isRaising: true,
      isLookingForCoFounder: false,
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      team: [{ founder: founderIds['priya-nair'], role: 'cto' as const, isPrimary: true }],
      description: richText(['LearnLoop personalizes curriculum paths for K-12 students at scale.']),
    },
    {
      name: 'GreenGrid',
      slug: 'greengrid',
      tagline: 'Clean energy for commercial buildings',
      industry: industryIds.climate,
      organizations: [organizationIds.nsrcel],
      city: 'Mumbai',
      country: 'India',
      womenLed: false,
      isHiring: false,
      isRaising: false,
      isLookingForCoFounder: false,
      moderationStatus: 'approved' as const,
      verificationStatus: 'pending' as const,
      team: [{ founder: founderIds['vikram-patel'], role: 'advisor' as const, isPrimary: true }],
      description: richText(['GreenGrid optimizes solar deployment for mid-size commercial properties.']),
    },
    {
      name: 'StackPilot',
      slug: 'stackpilot',
      tagline: 'DevOps for lean teams',
      industry: industryIds.saas,
      organizations: [organizationIds.nsrcel],
      city: 'Bengaluru',
      country: 'India',
      womenLed: false,
      isHiring: false,
      isRaising: false,
      isLookingForCoFounder: true,
      moderationStatus: 'approved' as const,
      verificationStatus: 'pending' as const,
      team: [
        { founder: founderIds['priya-nair'], role: 'advisor' as const, isPrimary: false },
        { founder: founderIds['rahul-menon'], role: 'founder' as const, isPrimary: true },
      ],
      description: richText(['StackPilot automates CI/CD workflows for early-stage SaaS teams.']),
    },
    {
      name: 'NovaForge',
      slug: 'novaforge',
      tagline: 'Unclaimed startup for claim-flow testing',
      industry: industryIds.saas,
      organizations: [organizationIds.nsrcel],
      city: 'Bengaluru',
      country: 'India',
      womenLed: false,
      isHiring: true,
      isRaising: false,
      isLookingForCoFounder: true,
      moderationStatus: 'approved' as const,
      verificationStatus: 'verified' as const,
      claim: {
        claimStatus: 'unclaimed' as const,
      },
      description: richText([
        'NovaForge is a seeded startup left unclaimed so founders can test the claim flow.',
      ]),
    },
  ]

  const startupIds: Record<string, number> = {}

  for (const startup of startupData) {
    const existing = await payload.find({
      collection: 'startups',
      where: { slug: { equals: startup.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      startupIds[startup.slug] = existing.docs[0].id
      console.log(`Startup exists: ${startup.name}`)
    } else {
      const created = await payload.create({ collection: 'startups', data: startup })
      startupIds[startup.slug] = created.id
      console.log(`Created startup: ${startup.name}`)
    }
  }

  await payload.update({
    collection: 'founders',
    id: founderIds['ananya-sharma'],
    data: {
      linkedStartups: [startupIds['payflow-india']],
    },
  })

  await payload.update({
    collection: 'founders',
    id: founderIds['meera-iyer'],
    data: {
      linkedStartups: [startupIds.clinicbridge],
    },
  })

  await payload.update({
    collection: 'founders',
    id: founderIds['priya-nair'],
    data: {
      linkedStartups: [startupIds.learnloop, startupIds.stackpilot],
    },
  })

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
