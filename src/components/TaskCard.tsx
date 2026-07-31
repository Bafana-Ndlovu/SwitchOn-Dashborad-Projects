import { Link } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { Avatar } from './Avatar'
import { PriorityBadge } from './Badge'
import { useWorkspace } from '../hooks/useWorkspace'
import { isTaskOverdue } from '../hooks/useStats'
import { describeDeadline, formatShortDate } from '../utils/dates'
import { TASK_STATUSES, taskStatusLabel } from '../utils/labels'
import type { Task, TaskStatus } from '../types'

interface TaskCardProps {
  task: Task
  /** Shows which project the task belongs to — used outside a project page. */
  showProject?: boolean
}

export function TaskCard({ task, showProject = false }: TaskCardProps) {
  const { getMember, getProject, setTaskStatus } = useWorkspace()
  const assignee = getMember(task.assigneeId)
  const project = getProject(task.projectId)
  const overdue = isTaskOverdue(task)

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    setTaskStatus(task.id, event.target.value as TaskStatus)
  }

  return (
    <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/*
            Line clamping rather than `truncate`: a nowrap title refuses to
            shrink below its full width and pushes the whole card off-screen on
            narrow viewports.
          */}
          <Link
            to={`/tasks/${task.id}`}
            className="line-clamp-2 block text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {task.title}
          </Link>
          {showProject && project && (
            <Link
              to={`/projects/${project.id}`}
              className="mt-0.5 line-clamp-1 block text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {project.name}
            </Link>
          )}
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar member={assignee} size="sm" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {assignee ? assignee.name : 'Unassigned'}
          </span>
        </div>

        <span
          title={describeDeadline(task.dueDate)}
          className={`text-xs font-medium ${
            overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {overdue ? '⚠ ' : ''}
          {formatShortDate(task.dueDate)}
        </span>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Status for {task.title}</span>
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-white dark:hover:bg-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
