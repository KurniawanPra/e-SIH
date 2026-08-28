export function normalizeName(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}

export function normalizeEmail(value?: string | null): string {
  return (value || '').trim().toLowerCase()
}

export function isSamePerson(
  a?: { name?: string | null; email?: string | null } | null,
  b?: { name?: string | null; email?: string | null } | null,
): boolean {
  if (!a || !b) return false

  const emailA = normalizeEmail(a.email)
  const emailB = normalizeEmail(b.email)
  if (emailA && emailB && emailA === emailB) return true

  const nameA = normalizeName(a.name)
  const nameB = normalizeName(b.name)
  if (!nameA || !nameB) return false

  // A shared first name is not enough to identify a person.
  return nameA === nameB
}

export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  const classes: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  return classes.join(' ')
}
