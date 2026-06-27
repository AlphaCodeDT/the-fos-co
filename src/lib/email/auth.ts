import type { Founder } from '@/payload-types'

import { absoluteUrl } from '@/lib/url'

import { emailSubjects } from './subjects'
import { wrapEmailHtml } from './templates'

export function generateVerifyEmailHTML({
  token,
}: {
  token: string
  user?: Founder
}): string {
  const verifyUrl = absoluteUrl(`/verify?token=${encodeURIComponent(token)}`)

  return wrapEmailHtml({
    title: 'Verify your email',
    body: `<p>Thanks for signing up. Please confirm your email address to activate your founder account.</p>`,
    cta: { label: 'Verify email', href: verifyUrl },
  })
}

export function generateVerifyEmailSubject(): string {
  return emailSubjects.verifyEmail
}

export function generateForgotPasswordEmailHTML({
  token,
}: {
  token?: string
}): string {
  const resetUrl = absoluteUrl(`/reset-password?token=${encodeURIComponent(token || '')}`)

  return wrapEmailHtml({
    title: 'Reset your password',
    body: `<p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>`,
    cta: { label: 'Reset password', href: resetUrl },
  })
}

export function generateForgotPasswordEmailSubject(): string {
  return emailSubjects.forgotPassword
}
