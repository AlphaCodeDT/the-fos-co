import { siteConfig } from '@/lib/site'

export const emailSubjects = {
  verifyEmail: `Verify your email — ${siteConfig.name}`,
  forgotPassword: `Reset your password — ${siteConfig.name}`,
  claimSubmitted: `New startup claim — ${siteConfig.name}`,
  claimApproved: `Your startup claim was approved — ${siteConfig.name}`,
  claimRejected: `Your startup claim was not approved — ${siteConfig.name}`,
  submissionPending: `New submission pending review — ${siteConfig.name}`,
} as const
