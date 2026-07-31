const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Midnight today, so "overdue" never depends on the time of day. */
export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function parseDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Whole days from today to `iso`. Negative once the date has passed. */
export function daysUntil(iso: string): number {
  return Math.round(
    (parseDate(iso).getTime() - startOfToday().getTime()) / MS_PER_DAY,
  )
}

export function isOverdue(iso: string): boolean {
  return daysUntil(iso) < 0
}

export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  })
}

/** Turns a timestamp into "3 days ago", "in 2 weeks", "today". */
export function formatRelative(isoTimestamp: string): string {
  const then = new Date(isoTimestamp)
  const diffDays = Math.round(
    (then.getTime() - Date.now()) / MS_PER_DAY,
  )

  if (diffDays === 0) return 'today'

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (Math.abs(diffDays) < 7) return formatter.format(diffDays, 'day')
  if (Math.abs(diffDays) < 30) {
    return formatter.format(Math.round(diffDays / 7), 'week')
  }
  return formatter.format(Math.round(diffDays / 30), 'month')
}

/** "Due in 3 days" / "Overdue by 5 days" / "Due today". */
export function describeDeadline(iso: string): string {
  const days = daysUntil(iso)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 0) return `Due in ${days} days`
  if (days === -1) return 'Overdue by 1 day'
  return `Overdue by ${Math.abs(days)} days`
}

/** Today as `YYYY-MM-DD`, for date-input defaults and `min` attributes. */
export function todayIso(): string {
  const today = startOfToday()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}
