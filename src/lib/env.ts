/** Opt-in email verification — requires verified Resend sending domain. */
export function isEmailVerificationRequired(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
}
