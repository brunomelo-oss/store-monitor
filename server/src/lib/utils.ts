export function toISO(
  value: Date | string | null | undefined,
  fallback?: string | null,
): string | null {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return fallback ?? null
}
