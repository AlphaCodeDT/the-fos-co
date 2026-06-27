'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  OPPORTUNITY_TYPE_OPTIONS,
  selectClassName,
  textareaClassName,
} from '@/components/account/startup-form-constants'
import type { Startup } from '@/payload-types'

type OpportunityRow = {
  type: string
  title: string
  description: string
  link: string
}

function toOpportunityRows(opportunities: Startup['opportunities'] | undefined): OpportunityRow[] {
  if (!opportunities?.length) return []

  return opportunities.map((row) => ({
    type: row.type,
    title: row.title,
    description: row.description || '',
    link: row.link || '',
  }))
}

export function OpportunitySection({ opportunities }: { opportunities?: Startup['opportunities'] }) {
  const [rows, setRows] = useState<OpportunityRow[]>(() => toOpportunityRows(opportunities))

  function addRow() {
    setRows((prev) => [...prev, { type: 'job', title: '', description: '', link: '' }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-brand-white">Opportunities</legend>
      <p className="text-xs text-brand-white/50">Jobs, internships, co-founder roles, or partnerships.</p>
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-brand-white/10 p-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor={`opportunity-type-${index}`}>Type</Label>
            <select
              id={`opportunity-type-${index}`}
              name={`opportunities[${index}].type`}
              className={selectClassName}
              value={row.type}
              onChange={(event) => {
                const type = event.target.value
                setRows((prev) => prev.map((item, i) => (i === index ? { ...item, type } : item)))
              }}
            >
              {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`opportunity-title-${index}`}>Title</Label>
            <Input
              id={`opportunity-title-${index}`}
              name={`opportunities[${index}].title`}
              value={row.title}
              onChange={(event) => {
                const title = event.target.value
                setRows((prev) => prev.map((item, i) => (i === index ? { ...item, title } : item)))
              }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`opportunity-description-${index}`}>Description</Label>
            <textarea
              id={`opportunity-description-${index}`}
              name={`opportunities[${index}].description`}
              rows={3}
              className={textareaClassName}
              value={row.description}
              onChange={(event) => {
                const description = event.target.value
                setRows((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, description } : item)),
                )
              }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`opportunity-link-${index}`}>Link</Label>
            <Input
              id={`opportunity-link-${index}`}
              name={`opportunities[${index}].link`}
              value={row.link}
              onChange={(event) => {
                const link = event.target.value
                setRows((prev) => prev.map((item, i) => (i === index ? { ...item, link } : item)))
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" onClick={() => removeRow(index)}>
              Remove opportunity
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        Add opportunity
      </Button>
    </fieldset>
  )
}
