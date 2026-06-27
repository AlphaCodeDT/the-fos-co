import { redirect } from 'next/navigation'

import { SignupForm } from '@/components/auth/SignupForm'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { getCurrentFounder } from '@/lib/auth/founder'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Create account'),
}

export default async function SignupPage() {
  const founder = await getCurrentFounder()

  if (founder) {
    redirect('/account')
  }

  return (
    <AuthPageLayout>
      <SignupForm />
    </AuthPageLayout>
  )
}
