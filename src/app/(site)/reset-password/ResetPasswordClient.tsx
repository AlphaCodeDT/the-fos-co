'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { AuthCard, AuthFooterLink, AuthMessage } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordAction, type AuthActionState } from '@/lib/auth/actions'

const initialState: AuthActionState = {}

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, action, pending] = useActionState(resetPasswordAction, initialState)

  if (state.success) {
    return (
      <AuthCard title="Password updated" subtitle={state.success}>
        <Link href="/login">
          <Button className="w-full">Sign in</Button>
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password for your founder account.">
      <AuthMessage {...state} />
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending || !token}>
          {pending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      {!token ? (
        <p className="mt-4 text-sm text-red-300">Reset token is missing. Request a new reset link.</p>
      ) : null}
      <AuthFooterLink href="/forgot-password">Request a new reset link</AuthFooterLink>
    </AuthCard>
  )
}
