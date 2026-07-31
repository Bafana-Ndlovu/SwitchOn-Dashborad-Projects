import type { Priority, ProjectStatus, TaskStatus } from '../types'

export const TASK_STATUSES: TaskStatus[] = [
  'todo',
  'in-progress',
  'in-review',
  'completed',
]

export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent']

export const PROJECT_STATUSES: ProjectStatus[] = [
  'active',
  'on-hold',
  'completed',
]

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  completed: 'Completed',
}

export const projectStatusLabel: Record<ProjectStatus, string> = {
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
}

export const priorityLabel: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const taskStatusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
  'in-progress': 'bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 ring-sky-200 dark:ring-sky-500/30',
  'in-review': 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30',
  completed: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30',
}

export const projectStatusStyles: Record<ProjectStatus, string> = {
  active: 'bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 ring-sky-200 dark:ring-sky-500/30',
  'on-hold': 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30',
  completed: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30',
}

export const priorityStyles: Record<Priority, string> = {
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
  medium: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-500/30',
  high: 'bg-orange-100 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 ring-orange-200 dark:ring-orange-500/30',
  urgent: 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 ring-rose-200 dark:ring-rose-500/30',
}

/** The next status in the To Do → In Progress → In Review → Completed flow. */
export function nextStatus(status: TaskStatus): TaskStatus | null {
  const index = TASK_STATUSES.indexOf(status)
  return index === TASK_STATUSES.length - 1 ? null : TASK_STATUSES[index + 1]
}

/** Two initials for an avatar chip. */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
