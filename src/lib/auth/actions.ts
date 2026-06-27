'use server'

import { randomBytes } from 'crypto'

import config from '@payload-config'
import { login, logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'

import { headers } from 'next/headers'

import { isEmailVerificationRequired } from '@/lib/env'
import { generateVerifyEmailHTML, generateVerifyEmailSubject } from '@/lib/email/auth'
import { getPayloadClient } from '@/lib/payload'

import { sanitizeRedirectPath } from './redirect'

export type AuthActionState = {
  error?: string
  success?: string
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  // Turnstile seam — no-op until configured
  const _turnstileToken = formData.get('turnstileToken')

  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: 'founders',
      data: {
        name,
        email,
        password,
      } as never,
      overrideAccess: true,
    })

    if (isEmailVerificationRequired()) {
      return {
        success: 'Account created. Check your email to verify your address before signing in.',
      }
    }

    return {
      success: 'Account created. You can sign in now — your profile is pending editor review.',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed.'
    return { error: message }
  }
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const redirectTo = sanitizeRedirectPath(String(formData.get('redirect') || ''))

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    const result = await login({
      collection: 'founders',
      config,
      email,
      password,
    })

    const user = result.user as { _verified?: boolean } | undefined

    if (isEmailVerificationRequired() && user && user._verified === false) {
      await logout({ allSessions: true, config })
      return {
        error:
          'Please verify your email before signing in. Use the resend link below if you need a new verification email.',
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid email or password.'
    return { error: message }
  }

  redirect(redirectTo)
}

export async function logoutAction(): Promise<void> {
  await logout({ allSessions: true, config })
  redirect('/login')
}

export async function verifyEmailAction(token: string): Promise<AuthActionState> {
  if (!token) {
    return { error: 'Verification token is missing.' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.verifyEmail({
      collection: 'founders',
      token,
    })

    return { success: 'Email verified. You can sign in now.' }
  } catch {
    return { error: 'This verification link is invalid or has expired.' }
  }
}

export async function resendVerificationAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()

  if (!email) {
    return { error: 'Email is required.' }
  }

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'founders',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    const founder = docs[0] as (typeof docs)[0] & { _verified?: boolean }

    if (!founder || founder._verified) {
      return {
        success: 'If an unverified account exists for that email, a new verification link has been sent.',
      }
    }

    const token = randomBytes(32).toString('hex')

    await payload.update({
      collection: 'founders',
      id: founder.id,
      data: {
        _verificationToken: token,
      } as never,
      overrideAccess: true,
    })

    await payload.sendEmail({
      to: founder.email,
      subject: generateVerifyEmailSubject(),
      html: generateVerifyEmailHTML({ token, user: founder }),
    })

    return {
      success: 'If an unverified account exists for that email, a new verification link has been sent.',
    }
  } catch {
    return { error: 'Could not send verification email. Try again later.' }
  }
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()

  if (!email) {
    return { error: 'Email is required.' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.forgotPassword({
      collection: 'founders',
      data: { email },
      overrideAccess: true,
    })

    return {
      success: 'If an account exists for that email, password reset instructions have been sent.',
    }
  } catch {
    return {
      success: 'If an account exists for that email, password reset instructions have been sent.',
    }
  }
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirmPassword') || '')

  if (!token || !password) {
    return { error: 'Token and new password are required.' }
  }

  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.resetPassword({
      collection: 'founders',
      data: { token, password },
      overrideAccess: true,
    })

    return { success: 'Password updated. You can sign in now.' }
  } catch {
    return { error: 'This reset link is invalid or has expired.' }
  }
}

export async function changePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const currentPassword = String(formData.get('currentPassword') || '')
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirmPassword') || '')

  if (!currentPassword || !password) {
    return { error: 'Current and new passwords are required.' }
  }

  if (password !== confirm) {
    return { error: 'New passwords do not match.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })

    if (!user || user.collection !== 'founders') {
      return { error: 'You must be signed in to change your password.' }
    }

    try {
      await payload.login({
        collection: 'founders',
        data: {
          email: user.email,
          password: currentPassword,
        },
      })
    } catch {
      return { error: 'Current password is incorrect.' }
    }

    await payload.update({
      collection: 'founders',
      id: user.id,
      data: { password },
      user,
    })

    return { success: 'Password updated successfully.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update password.'
    return { error: message }
  }
}
