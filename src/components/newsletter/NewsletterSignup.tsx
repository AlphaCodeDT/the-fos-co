'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Newsletter
        </p>
        <h2 className="mt-2 text-2xl font-bold text-brand-white">Stay close to the ecosystem</h2>
        <p className="mt-2 text-brand-white/70">
          Get founder stories and startup news in your inbox. Email capture only for now — no
          provider wired yet.
        </p>
      </div>

      {submitted ? (
        <p className="mt-6 text-sm text-brand-yellow" role="status">
          Thanks — we&apos;ll be in touch when the newsletter launches.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="newsletter-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@startup.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit">Subscribe</Button>
        </form>
      )}
    </section>
  )
}
