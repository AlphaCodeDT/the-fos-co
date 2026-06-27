'use client'

import { useActionState } from 'react'

import { AuthCard, AuthFooterLink, AuthMessage } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  loginAction,
  resendVerificationAction,
  type AuthActionState,
} from '@/lib/auth/actions'

const initialState: AuthActionState = {}

function ResendVerification() {
  const [state, action, pending] = useActionState(resendVerificationAction, initialState)

  return (
    <form action={action} className="mt-4 space-y-3 rounded-lg border border-brand-white/10 p-4">
      <p className="text-sm text-brand-white/70">Need a new verification email?</p>
      <div className="space-y-2">
        <Label htmlFor="resend-email">Email</Label>
        <Input id="resend-email" name="email" type="email" required />
      </div>
      <AuthMessage {...state} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? 'Sending…' : 'Resend verification email'}
      </Button>
    </form>
  )
}

export function LoginForm({
  redirect,
  defaultEmail,
}: {
  redirect?: string
  defaultEmail?: string
}) {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your founder account to manage your profile and startups."
    >
      <AuthMessage {...state} />
      <form action={action} className="space-y-4">
        {redirect ? <input type="hidden" name="redirect" value={redirect} /> : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {state.error?.toLowerCase().includes('verify') ? <ResendVerification /> : null}
      <AuthFooterLink href="/forgot-password">Forgot your password?</AuthFooterLink>
      <AuthFooterLink href="/signup">Create a founder account</AuthFooterLink>
    </AuthCard>
  )
}
