import Link from 'next/link'

import { AuthCard } from '@/components/auth/AuthShell'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { Button } from '@/components/ui/button'
import { verifyEmailAction } from '@/lib/auth/actions'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Verify email'),
}

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const result = token ? await verifyEmailAction(token) : { error: 'Verification token is missing.' }

  return (
    <AuthPageLayout>
      <AuthCard
        title={result.success ? 'Email verified' : 'Verification failed'}
        subtitle={result.success || result.error}
      >
        <Link href="/login">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </AuthCard>
    </AuthPageLayout>
  )
}
