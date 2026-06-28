const CITY_ALIASES: Record<string, string> = {
  Bangalore: 'Bengaluru',
  Bombay: 'Mumbai',
  Calcutta: 'Kolkata',
  Madras: 'Chennai',
  Gurgaon: 'Gurugram',
  Poona: 'Pune',
  Trivandrum: 'Thiruvananthapuram',
}

export function formatLocationCity(city: string): string {
  const trimmed = city.trim()
  const base = trimmed.replace(/\s+(Urban|Rural|District)$/i, '')
  return CITY_ALIASES[base] ?? base
}

export function formatLocationLine(
  city?: string | null,
  state?: string | null,
  country?: string | null,
): string {
  return [city ? formatLocationCity(city) : null, state, country].filter(Boolean).join(', ')
}
