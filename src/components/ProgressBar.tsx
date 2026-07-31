interface ProgressBarProps {
  percent: number
  /** Shows the numeric value above the track. */
  label?: string
  size?: 'sm' | 'md'
}

function barColor(percent: number): string {
  if (percent === 100) return 'bg-emerald-500'
  if (percent >= 60) return 'bg-indigo-500'
  if (percent >= 30) return 'bg-sky-500'
  return 'bg-amber-500'
}

export function ProgressBar({ percent, label, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div>
      {label !== undefined && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={`w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        }`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${barColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
