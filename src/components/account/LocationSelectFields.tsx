'use client'

import { useEffect, useMemo, useState } from 'react'

import { Label } from '@/components/ui/label'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_COUNTRY_NAME,
  type LocationValues,
} from '@/lib/location/constants'

type GeoState = { isoCode: string; name: string; countryCode: string }
type GeoCity = { name: string; stateCode: string; countryCode: string }
type GeoCountry = { isoCode: string; name: string }

type LocationSelectFieldsProps = {
  initialValues?: Partial<LocationValues>
  className?: string
}

function resolveInitialValues(initialValues?: Partial<LocationValues>): LocationValues {
  return {
    country: initialValues?.country?.trim() || DEFAULT_COUNTRY_NAME,
    state: initialValues?.state?.trim() || '',
    city: initialValues?.city?.trim() || '',
    stateCode: initialValues?.stateCode?.trim() || '',
  }
}

export function LocationSelectFields({ initialValues, className }: LocationSelectFieldsProps) {
  const [values, setValues] = useState<LocationValues>(() => resolveInitialValues(initialValues))
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [countries, setCountries] = useState<GeoCountry[]>([])
  const [states, setStates] = useState<GeoState[]>([])
  const [cities, setCities] = useState<GeoCity[]>([])
  const [libraryReady, setLibraryReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadLibrary() {
      const { Country, State, City } = await import('country-state-city')

      if (cancelled) return

      const allCountries = Country.getAllCountries()
      setCountries(allCountries)

      const resolvedCountry =
        allCountries.find(
          (country) =>
            country.name === values.country || country.isoCode === values.country,
        ) ?? allCountries.find((country) => country.isoCode === DEFAULT_COUNTRY_CODE)

      const nextCountryCode = resolvedCountry?.isoCode ?? DEFAULT_COUNTRY_CODE
      setCountryCode(nextCountryCode)

      const countryStates = State.getStatesOfCountry(nextCountryCode)
      setStates(countryStates)

      const matchedState =
        countryStates.find(
          (state) =>
            state.isoCode === values.stateCode ||
            state.name === values.state,
        ) ?? null

      if (matchedState) {
        setCities(City.getCitiesOfState(nextCountryCode, matchedState.isoCode))
      } else {
        setCities([])
      }

      setLibraryReady(true)
    }

    void loadLibrary()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from initial doc values
  }, [])

  const countryOptions: SearchableSelectOption[] = useMemo(
    () =>
      countries.map((country) => ({
        value: country.isoCode,
        label: country.name,
      })),
    [countries],
  )

  const stateOptions: SearchableSelectOption[] = useMemo(
    () =>
      states.map((state) => ({
        value: state.isoCode,
        label: state.name,
      })),
    [states],
  )

  const cityOptions: SearchableSelectOption[] = useMemo(
    () =>
      cities.map((city) => ({
        value: city.name,
        label: city.name,
      })),
    [cities],
  )

  const selectedStateCode =
    values.stateCode ||
    states.find((state) => state.name === values.state)?.isoCode ||
    ''

  async function handleCountryChange(option: SearchableSelectOption) {
    const { Country, State } = await import('country-state-city')
    const country = Country.getCountryByCode(option.value)
    const nextCountryCode = country?.isoCode ?? option.value
    const countryStates = State.getStatesOfCountry(nextCountryCode)

    setCountryCode(nextCountryCode)
    setStates(countryStates)
    setCities([])
    setValues({
      country: country?.name ?? option.label,
      state: '',
      city: '',
      stateCode: '',
    })
  }

  async function handleStateChange(option: SearchableSelectOption) {
    const { City } = await import('country-state-city')
    const state = states.find((item) => item.isoCode === option.value)
    const nextStateCode = state?.isoCode ?? option.value
    const stateCities = City.getCitiesOfState(countryCode, nextStateCode)

    setCities(stateCities)
    setValues((prev) => ({
      ...prev,
      state: state?.name ?? option.label,
      stateCode: nextStateCode,
      city: '',
    }))
  }

  function handleCityChange(option: SearchableSelectOption) {
    setValues((prev) => ({
      ...prev,
      city: option.label,
    }))
  }

  const legacySummary =
    !libraryReady && (values.city || values.state || values.country)
      ? [values.city, values.state, values.country].filter(Boolean).join(', ')
      : null

  return (
    <div className={className}>
      <input type="hidden" name="country" value={values.country} />
      <input type="hidden" name="state" value={values.state} />
      <input type="hidden" name="city" value={values.city} />
      <input type="hidden" name="stateCode" value={values.stateCode} />

      {legacySummary ? (
        <p className="mb-3 text-xs text-brand-white/50">Current location: {legacySummary}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location-country">Country</Label>
          <SearchableSelect
            id="location-country"
            options={countryOptions}
            value={countryCode}
            onChange={handleCountryChange}
            placeholder={values.country || DEFAULT_COUNTRY_NAME}
            searchPlaceholder="Search countries…"
            disabled={!libraryReady}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-state">State</Label>
          <SearchableSelect
            id="location-state"
            options={stateOptions}
            value={selectedStateCode}
            onChange={handleStateChange}
            placeholder={values.state || 'Select state'}
            searchPlaceholder="Search states…"
            disabled={!libraryReady || states.length === 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-city">City</Label>
          <SearchableSelect
            id="location-city"
            options={cityOptions}
            value={values.city}
            onChange={handleCityChange}
            placeholder={values.city || 'Select city'}
            searchPlaceholder="Search cities…"
            disabled={!libraryReady || !selectedStateCode}
          />
        </div>
      </div>
    </div>
  )
}
