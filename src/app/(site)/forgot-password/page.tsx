import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { formatPageTitle } from '@/lib/site'

export const metadata = {
  title: formatPageTitle('Forgot password'),
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  )
}
