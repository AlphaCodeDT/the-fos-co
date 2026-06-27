'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { AuthCard, AuthFooterLink, AuthMessage } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordAction, type AuthActionState } from '@/lib/auth/actions'

const initialState: AuthActionState = {}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState)

  if (state.success) {
    return (
      <AuthCard title="Check your email" subtitle={state.success}>
        <Link href="/login">
          <Button className="w-full">Back to sign in</Button>
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot password" subtitle="We'll email you a link to reset your password.">
      <AuthMessage {...state} />
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <AuthFooterLink href="/login">Back to sign in</AuthFooterLink>
    </AuthCard>
  )
}
