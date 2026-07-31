import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { ProjectStatusBadge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/ProgressBar'
import { TaskCard } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/StateViews'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWorkspace } from '../hooks/useWorkspace'
import { calculateProgress } from '../hooks/useStats'
import { describeDeadline, formatDate, formatRelative } from '../utils/dates'
import { TASK_STATUSES, taskStatusLabel } from '../utils/labels'
import type { TaskDraft, TaskStatus, TeamMember } from '../types'

type TaskFilter = TaskStatus | 'all'

export default function ProjectDetail() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const {
    loading,
    error,
    reload,
    getProject,
    getMember,
    tasksForProject,
    activityForProject,
    createTask,
  } = useWorkspace()

  const project = getProject(projectId)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [adding, setAdding] = useState<boolean>(false)

  useDocumentTitle(project?.name ?? 'Project')

  const tasks = tasksForProject(projectId)
  const progress = calculateProgress(tasks, project?.dueDate ?? '')
  const activity = activityForProject(projectId)

  const visibleTasks = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)),
    [tasks, filter],
  )

  if (loading) return <LoadingState label="Loading project…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  if (!project) {
    return (
      <EmptyState
        icon="🧭"
        title="Project not found"
        description={`No project matches the id "${projectId}". It may have been removed.`}
        action={
          <Link
            to="/projects"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to projects
          </Link>
        }
      />
    )
  }

  const members = project.memberIds
    .map(getMember)
    .filter((member): member is TeamMember => member !== undefined)

  function handleCreate(draft: TaskDraft): void {
    createTask(draft)
    setAdding(false)
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link to="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Projects
        </Link>
        <span className="mx-2 text-slate-500 dark:text-slate-400">/</span>
        <span className="text-slate-700 dark:text-slate-300">{project.name}</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {project.client}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <dl className="mt-8 grid gap-5 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Started" value={formatDate(project.startDate)} />
          <Detail label="Due" value={formatDate(project.dueDate)} />
          <Detail
            label="Timeline"
            value={
              project.status === 'completed'
                ? 'Delivered'
                : describeDeadline(project.dueDate)
            }
            tone={
              project.status !== 'completed' && progress.daysRemaining < 0
                ? 'danger'
                : 'default'
            }
          />
          <Detail
            label="Overdue tasks"
            value={String(progress.overdue)}
            tone={progress.overdue > 0 ? 'danger' : 'default'}
          />
        </dl>

        <div className="mt-6">
          <ProgressBar
            percent={progress.percent}
            label={`${progress.completed} of ${progress.total} tasks completed`}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tasks</h2>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <span aria-hidden="true">＋</span> Add task
            </button>
          </div>

          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter tasks by status"
          >
            {(['all', ...TASK_STATUSES] as TaskFilter[]).map((option) => {
              const count =
                option === 'all'
                  ? tasks.length
                  : tasks.filter((task) => task.status === option).length
              const selected = filter === option

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option === 'all' ? 'All' : taskStatusLabel[option]} ({count})
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            {tasks.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No tasks yet"
                description="This project has been kicked off but the work has not been broken down. Add the first task to get going."
                action={
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Add the first task
                  </button>
                }
              />
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                icon="🗂️"
                title={`Nothing in ${taskStatusLabel[filter as TaskStatus]}`}
                description="Try another status filter to see the rest of this project's work."
                action={
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Show all tasks
                  </button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Team</h2>
            {members.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No one has been assigned to this project yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {members.map((member) => {
                  const assigned = tasks.filter(
                    (task) => task.assigneeId === member.id,
                  )
                  const done = assigned.filter(
                    (task) => task.status === 'completed',
                  ).length

                  return (
                    <li key={member.id} className="flex items-center gap-3">
                      <Avatar member={member} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {member.name}
                        </p>
                        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                          {member.role}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {done}/{assigned.length}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent activity
            </h2>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Nothing has been logged on this project yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {activity.slice(0, 6).map((entry) => {
                  const member = getMember(entry.memberId)
                  return (
                    <li key={entry.id} className="flex gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          member?.color ?? 'bg-slate-300'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {member?.name ?? 'Someone'}
                          </span>{' '}
                          {entry.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatRelative(entry.timestamp)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Modal
        open={adding}
        title={`Add a task to ${project.name}`}
        onClose={() => setAdding(false)}
      >
        <TaskForm
          defaultProjectId={project.id}
          onSubmit={handleCreate}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  )
}

interface DetailProps {
  label: string
  value: string
  tone?: 'default' | 'danger'
}

function Detail({ label, value, tone = 'default' }: DetailProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-semibold ${
          tone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
