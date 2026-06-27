'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { AuthCard, AuthFooterLink, AuthMessage } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupAction, type AuthActionState } from '@/lib/auth/actions'

const initialState: AuthActionState = {}

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState)

  if (state.success) {
    return (
      <AuthCard title="Check your email" subtitle={state.success}>
        <Link href="/login">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join the community. Your profile stays private until an editor approves it."
    >
      <AuthMessage {...state} />
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-xs text-brand-white/50">At least 8 characters</p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <AuthFooterLink href="/login">Already have an account? Sign in</AuthFooterLink>
    </AuthCard>
  )
}
