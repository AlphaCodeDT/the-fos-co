'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SearchPickerRow({
  avatar,
  primary,
  secondary,
}: {
  avatar: ReactNode
  primary: string
  secondary?: string | null
}) {
  return (
    <>
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-brand-white">{primary}</span>
        {secondary ? (
          <span className="mt-0.5 block text-xs text-brand-white/50">{secondary}</span>
        ) : null}
      </span>
    </>
  )
}

type SearchPickerProps<T> = {
  inputId: string
  label: string
  placeholder: string
  query: string
  onQueryChange: (query: string) => void
  results: T[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isSearching: boolean
  getKey: (item: T) => string | number
  renderOption: (item: T) => ReactNode
  onFocus?: () => void
  footer?: ReactNode
}

export function SearchPicker<T>({
  inputId,
  label,
  placeholder,
  query,
  onQueryChange,
  results,
  isOpen,
  onOpenChange,
  isSearching,
  getKey,
  renderOption,
  onFocus,
  footer,
}: SearchPickerProps<T>) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [onOpenChange])

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        placeholder={placeholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => {
          onFocus?.()
          if (results.length > 0) {
            onOpenChange(true)
          }
        }}
      />

      {isSearching ? <p className="text-xs text-brand-white/40">Searching…</p> : null}

      {isOpen && results.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-brand-white/10 bg-brand-black shadow-lg"
        >
          {results.map((item) => (
            <li key={getKey(item)} role="option">
              {renderOption(item)}
            </li>
          ))}
        </ul>
      ) : null}

      {footer}
    </div>
  )
}
