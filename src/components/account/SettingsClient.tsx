'use client'

import { useActionState } from 'react'

import { AccountShell, FormMessage } from '@/components/account/AccountShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  changePasswordAction,
  logoutAction,
  type AuthActionState,
} from '@/lib/auth/actions'

const initialState: AuthActionState = {}

function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialState)

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6">
      <h2 className="text-lg font-semibold text-brand-white">Change password</h2>
      <FormMessage {...state} />
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}

function LogoutSection() {
  return (
    <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6">
      <h2 className="text-lg font-semibold text-brand-white">Sign out</h2>
      <p className="mt-2 text-sm text-brand-white/60">End your session on this device.</p>
      <form action={logoutAction} className="mt-4">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  )
}

export function AccountSettingsClient({ email }: { email: string }) {
  return (
    <AccountShell
      currentPath="/account/settings"
      title="Settings"
      description="Manage your account security."
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-brand-white/10 bg-brand-black/60 p-6">
          <h2 className="text-lg font-semibold text-brand-white">Email</h2>
          <p className="mt-2 text-sm text-brand-white/60">{email}</p>
          <p className="mt-2 text-xs text-brand-white/40">Email change is not available in this phase.</p>
        </div>
        <ChangePasswordForm />
        <LogoutSection />
      </div>
    </AccountShell>
  )
}
