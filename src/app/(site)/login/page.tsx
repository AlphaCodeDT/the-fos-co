import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { getCurrentFounder } from '@/lib/auth/founder'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Sign in'),
}

type PageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const founder = await getCurrentFounder()

  if (founder) {
    redirect('/account')
  }

  const { redirect: redirectParam } = await searchParams
  const redirectTo = sanitizeRedirectPath(redirectParam)

  return (
    <AuthPageLayout>
      <LoginForm redirect={redirectTo} />
    </AuthPageLayout>
  )
}
