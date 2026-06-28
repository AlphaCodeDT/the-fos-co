'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildRecentCohortYears } from '@/lib/location/constants'
import { selectClassName } from '@/components/account/startup-form-constants'

type CohortFormFieldsProps = {
  cohortName?: string | null
  cohortYear?: number | null
}

export function CohortFormFields({ cohortName, cohortYear }: CohortFormFieldsProps) {
  const years = buildRecentCohortYears()

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium text-brand-white">Cohort</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cohortName">Cohort name</Label>
          <Input
            id="cohortName"
            name="cohortName"
            defaultValue={cohortName || ''}
            placeholder="e.g. NSRCEL, Cohort 12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cohortYear">Cohort year</Label>
          <select
            id="cohortYear"
            name="cohortYear"
            className={selectClassName}
            defaultValue={cohortYear ?? ''}
          >
            <option value="">None</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  )
}
