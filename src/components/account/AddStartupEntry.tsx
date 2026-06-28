'use client'

import { useRef, useState } from 'react'

import { AddStartupPanel } from '@/components/account/AddStartupPanel'
import { Button } from '@/components/ui/button'

export function AddStartupEntry() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Add your startup
      </Button>
      {open ? (
        <AddStartupPanel triggerRef={triggerRef} onClose={() => setOpen(false)} />
      ) : null}
    </>
  )
}
