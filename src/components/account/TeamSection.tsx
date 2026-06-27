'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TEAM_ROLE_OPTIONS, selectClassName } from '@/components/account/startup-form-constants'
import type { Startup } from '@/payload-types'

type TeamRow = {
  founder: number
  role: string
  isPrimary: boolean
}

function toTeamRows(
  team: Startup['team'] | undefined,
  currentFounderId: number,
): TeamRow[] {
  if (team?.length) {
    return team.map((row) => ({
      founder:
        typeof row.founder === 'object' && row.founder ? row.founder.id : Number(row.founder),
      role: row.role,
      isPrimary: Boolean(row.isPrimary),
    }))
  }

  return [{ founder: currentFounderId, role: 'founder', isPrimary: true }]
}

export function TeamSection({
  team,
  currentFounderId,
}: {
  team?: Startup['team']
  currentFounderId: number
}) {
  const [rows, setRows] = useState<TeamRow[]>(() => toTeamRows(team, currentFounderId))

  function addRow() {
    setRows((prev) => [...prev, { founder: currentFounderId, role: 'co-founder', isPrimary: false }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-brand-white">Team</legend>
      <p className="text-xs text-brand-white/50">
        Add founders on your team by their profile ID (yours is {currentFounderId}).
      </p>
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-brand-white/10 p-4 sm:grid-cols-2"
        >
          <input type="hidden" name={`team[${index}].founder`} value={row.founder} />
          <div className="space-y-2">
            <Label htmlFor={`team-founder-${index}`}>Founder profile ID</Label>
            <Input
              id={`team-founder-${index}`}
              type="number"
              min={1}
              value={row.founder}
              onChange={(event) => {
                const founder = Number(event.target.value)
                setRows((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, founder } : item)),
                )
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`team-role-${index}`}>Role</Label>
            <select
              id={`team-role-${index}`}
              name={`team[${index}].role`}
              className={selectClassName}
              value={row.role}
              onChange={(event) => {
                const role = event.target.value
                setRows((prev) => prev.map((item, i) => (i === index ? { ...item, role } : item)))
              }}
            >
              {TEAM_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-white/80 sm:col-span-2">
            <input
              type="checkbox"
              name={`team[${index}].isPrimary`}
              checked={row.isPrimary}
              onChange={(event) => {
                const isPrimary = event.target.checked
                setRows((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, isPrimary } : item)),
                )
              }}
              className="accent-brand-yellow"
            />
            Primary contact
          </label>
          {rows.length > 1 ? (
            <div className="sm:col-span-2">
              <Button type="button" variant="outline" size="sm" onClick={() => removeRow(index)}>
                Remove member
              </Button>
            </div>
          ) : null}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        Add team member
      </Button>
    </fieldset>
  )
}
