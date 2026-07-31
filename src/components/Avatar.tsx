import type { TeamMember } from '../types'
import { initials } from '../utils/labels'

interface AvatarProps {
  member: TeamMember | undefined
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
}

export function Avatar({ member, size = 'md' }: AvatarProps) {
  if (!member) {
    return (
      <span
        title="Unassigned"
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-500 dark:text-slate-400 ${sizeClasses[size]}`}
      >
        ?
      </span>
    )
  }

  return (
    <span
      title={`${member.name} — ${member.role}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white dark:ring-slate-900 ${member.color} ${sizeClasses[size]}`}
    >
      {initials(member.name)}
    </span>
  )
}

interface AvatarGroupProps {
  members: TeamMember[]
  max?: number
}

export function AvatarGroup({ members, max = 4 }: AvatarGroupProps) {
  const shown = members.slice(0, max)
  const overflow = members.length - shown.length

  return (
    <div className="flex -space-x-2">
      {shown.map((member) => (
        <Avatar key={member.id} member={member} size="sm" />
      ))}
      {overflow > 0 && (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
          +{overflow}
        </span>
      )}
    </div>
  )
}
