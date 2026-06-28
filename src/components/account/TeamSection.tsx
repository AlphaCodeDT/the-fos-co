'use client'

import { useState } from 'react'

import { FounderSearchPicker } from '@/components/account/FounderSearchPicker'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TEAM_ROLE_OPTIONS, selectClassName } from '@/components/account/startup-form-constants'
import { founderToSearchResult } from '@/lib/founder-search-utils'
import type { Founder, Startup } from '@/payload-types'

export type CurrentFounder = Pick<
  Founder,
  'id' | 'name' | 'slug' | 'headline' | 'avatarUrl' | 'city'
> & {
  avatar?: Founder['avatar']
}

type TeamRow = {
  founderId: number | null
  displayName: string
  linkedProfile: ReturnType<typeof founderToSearchResult> | null
  role: string
  isPrimary: boolean
}

function rowFromTeamMember(row: NonNullable<Startup['team']>[number]): TeamRow | null {
  const founder =
    row.founder && typeof row.founder === 'object' ? row.founder : null

  if (founder) {
    return {
      founderId: founder.id,
      displayName: founder.name,
      linkedProfile: founderToSearchResult(founder),
      role: row.role,
      isPrimary: Boolean(row.isPrimary),
    }
  }

  if (row.name?.trim()) {
    return {
      founderId: null,
      displayName: row.name.trim(),
      linkedProfile: null,
      role: row.role,
      isPrimary: Boolean(row.isPrimary),
    }
  }

  if (typeof row.founder === 'number') {
    return {
      founderId: row.founder,
      displayName: '',
      linkedProfile: null,
      role: row.role,
      isPrimary: Boolean(row.isPrimary),
    }
  }

  return null
}

function defaultOwnerRow(currentFounder: CurrentFounder): TeamRow {
  return {
    founderId: currentFounder.id,
    displayName: currentFounder.name,
    linkedProfile: founderToSearchResult(currentFounder),
    role: 'founder',
    isPrimary: true,
  }
}

function toTeamRows(
  team: Startup['team'] | undefined,
  currentFounder: CurrentFounder,
): TeamRow[] {
  if (team?.length) {
    return team
      .map((row) => rowFromTeamMember(row))
      .filter((row): row is TeamRow => row !== null)
  }

  return [defaultOwnerRow(currentFounder)]
}

export function TeamSection({
  team,
  currentFounder,
}: {
  team?: Startup['team']
  currentFounder: CurrentFounder
}) {
  const [rows, setRows] = useState<TeamRow[]>(() => toTeamRows(team, currentFounder))

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        founderId: null,
        displayName: '',
        linkedProfile: null,
        role: 'co-founder',
        isPrimary: false,
      },
    ])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-brand-white">Team</legend>
      <p className="text-xs text-brand-white/50">
        Search for a founder by name, or enter a name if they&apos;re not on Founders of Startups
        yet.
      </p>
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-brand-white/10 p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <FounderSearchPicker
              inputId={`team-member-${index}`}
              founderFieldName={`team[${index}].founder`}
              nameFieldName={`team[${index}].name`}
              value={{
                founderId: row.founderId,
                displayName: row.displayName,
                linkedProfile: row.linkedProfile,
              }}
              onChange={(next) => {
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index
                      ? {
                          ...item,
                          founderId: next.founderId,
                          displayName: next.displayName,
                          linkedProfile: next.linkedProfile,
                        }
                      : item,
                  ),
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
