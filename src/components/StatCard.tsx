import { Link } from 'react-router-dom'

export type StatTone = 'default' | 'positive' | 'warning' | 'danger'

interface StatCardProps {
  label: string
  value: number | string
  icon: string
  hint?: string
  tone?: StatTone
  /** Turns the whole card into a link when provided. */
  to?: string
}

const toneStyles: Record<StatTone, string> = {
  default: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  positive: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'default',
  to,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${toneStyles[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </>
  )

  const className =
    'block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition'

  if (to) {
    return (
      <Link to={to} className={`${className} hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:shadow-md`}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
