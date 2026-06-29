import { Button } from '@/components/ui/button'
import { resolveConnectHref } from '@/lib/connect-url'

type ConnectButtonProps = {
  linkedIn?: string | null
  website?: string | null
}

export function ConnectButton({ linkedIn, website }: ConnectButtonProps) {
  const href = resolveConnectHref(linkedIn, website)
  if (!href) return null

  return (
    <Button asChild size="sm" className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90">
      <a href={href} target="_blank" rel="noopener noreferrer">
        Connect
      </a>
    </Button>
  )
}
