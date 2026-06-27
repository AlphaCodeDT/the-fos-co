import type { Founder, Startup, User } from '@/payload-types'
import type { Payload } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/url'

import { emailSubjects } from './subjects'
import { wrapEmailHtml } from './templates'

async function getEditorEmails(payload: Payload): Promise<string[]> {
  const fallback = process.env.EDITOR_NOTIFICATION_EMAIL

  const editors = await payload.find({
    collection: 'users',
    where: {
      role: { in: ['admin', 'editor'] },
    },
    limit: 100,
    overrideAccess: true,
  })

  const emails = editors.docs
    .map((user) => user.email)
    .filter((email): email is string => Boolean(email))

  if (emails.length === 0 && fallback) {
    return [fallback]
  }

  return emails
}

export async function notifyEditors(options: {
  subject: string
  title: string
  body: string
  cta?: { label: string; href: string }
}): Promise<void> {
  const payload = await getPayloadClient()
  const recipients = await getEditorEmails(payload)

  if (recipients.length === 0) {
    console.warn('[email] No editor recipients configured for notification:', options.subject)
    return
  }

  const html = wrapEmailHtml({
    title: options.title,
    body: options.body,
    cta: options.cta,
  })

  await Promise.all(
    recipients.map((to) =>
      payload.sendEmail({
        to,
        subject: options.subject,
        html,
      }),
    ),
  )
}

export async function notifyFounder(options: {
  founder: Founder | User | { email: string; name?: string | null }
  subject: string
  title: string
  body: string
  cta?: { label: string; href: string }
}): Promise<void> {
  if (!options.founder.email) return

  const payload = await getPayloadClient()
  const html = wrapEmailHtml({
    title: options.title,
    body: options.body,
    cta: options.cta,
  })

  await payload.sendEmail({
    to: options.founder.email,
    subject: options.subject,
    html,
  })
}

export async function notifyClaimSubmitted(startup: Startup, founder: Founder): Promise<void> {
  await notifyEditors({
    subject: emailSubjects.claimSubmitted,
    title: 'New startup claim',
    body: `<p><strong>${founder.name}</strong> submitted a claim for <strong>${startup.name}</strong>.</p><p>Review the claim in the admin panel.</p>`,
    cta: { label: 'Open admin', href: absoluteUrl('/admin/collections/startups') },
  })
}

export async function notifyClaimApproved(startup: Startup, founder: Founder): Promise<void> {
  await notifyFounder({
    founder,
    subject: emailSubjects.claimApproved,
    title: 'Claim approved',
    body: `<p>Your claim for <strong>${startup.name}</strong> was approved. You can now manage this startup from your account.</p>`,
    cta: { label: 'Go to account', href: absoluteUrl('/account/startups') },
  })
}

export async function notifyClaimRejected(startup: Startup, founder: Founder): Promise<void> {
  await notifyFounder({
    founder,
    subject: emailSubjects.claimRejected,
    title: 'Claim not approved',
    body: `<p>Your claim for <strong>${startup.name}</strong> was not approved at this time. The startup remains available for a future claim.</p>`,
  })
}

export async function notifySubmissionPending(options: {
  type: 'founder' | 'startup'
  name: string
}): Promise<void> {
  await notifyEditors({
    subject: emailSubjects.submissionPending,
    title: 'New submission pending review',
    body: `<p>A new ${options.type} profile <strong>${options.name}</strong> is pending moderation.</p>`,
    cta: {
      label: 'Open admin',
      href: absoluteUrl(
        options.type === 'founder' ? '/admin/collections/founders' : '/admin/collections/startups',
      ),
    },
  })
}
