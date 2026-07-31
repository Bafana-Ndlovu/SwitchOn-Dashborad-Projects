import { Link } from 'react-router-dom'
import { AvatarGroup } from '../components/Avatar'
import { ProgressBar } from '../components/ProgressBar'
import { StatCard } from '../components/StatCard'
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/StateViews'
import { ProjectStatusBadge, TaskStatusBadge } from '../components/Badge'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWorkspace } from '../hooks/useWorkspace'
import {
  calculateProgress,
  useDashboardStats,
  useUpcomingDeadlines,
} from '../hooks/useStats'
import { formatDate, formatRelative } from '../utils/dates'
import { taskStatusLabel } from '../utils/labels'
import { TASK_STATUSES } from '../utils/labels'
import type { TeamMember } from '../types'

export default function Dashboard() {
  useDocumentTitle('Dashboard')

  const {
    loading,
    error,
    reload,
    projects,
    tasks,
    activity,
    getMember,
    tasksForProject,
  } = useWorkspace()
  const stats = useDashboardStats()
  const deadlines = useUpcomingDeadlines(14)

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeading />
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeading />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <CardGridSkeleton count={3} />
      </div>
    )
  }

  const activeProjects = projects
    .filter((project) => project.status === 'active')
    .map((project) => ({
      project,
      progress: calculateProgress(tasksForProject(project.id), project.dueDate),
    }))
    .sort((a, b) => a.progress.daysRemaining - b.progress.daysRemaining)

  const statusBreakdown = TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }))

  const recentActivity = [...activity]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8)

  return (
    <div className="space-y-8">
      <PageHeading />

      <section aria-label="Portfolio summary">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total projects"
            value={stats.totalProjects}
            icon="📁"
            hint={`${stats.onHoldProjects} on hold`}
            to="/projects"
          />
          <StatCard
            label="Active projects"
            value={stats.activeProjects}
            icon="🚀"
            hint="Currently in flight"
            to="/projects?status=active"
          />
          <StatCard
            label="Completed projects"
            value={stats.completedProjects}
            icon="🏁"
            tone="positive"
            hint="Delivered and signed off"
            to="/projects?status=completed"
          />
          <StatCard
            label="Overdue tasks"
            value={stats.overdueTasks}
            icon="⏰"
            tone={stats.overdueTasks > 0 ? 'danger' : 'positive'}
            hint={
              stats.overdueTasks > 0 ? 'Past their due date' : 'Nothing is late'
            }
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total tasks" value={stats.totalTasks} icon="🗂️" />
          <StatCard
            label="Completed tasks"
            value={stats.completedTasks}
            icon="✅"
            tone="positive"
            hint={`${stats.completionRate}% of all tasks`}
          />
          <StatCard
            label="In progress"
            value={stats.inProgressTasks}
            icon="⚙️"
            tone="warning"
          />
          <StatCard
            label="Upcoming deadlines"
            value={deadlines.length}
            icon="📅"
            tone={deadlines.length > 0 ? 'warning' : 'default'}
            hint="Next 14 days, plus late work"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project progress
            </h2>
            <Link
              to="/projects"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              View all →
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="🌤️"
                title="No active projects"
                description="Every project is either completed or on hold right now."
              />
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {activeProjects.map(({ project, progress }) => {
                const members = project.memberIds
                  .map(getMember)
                  .filter((m): m is TeamMember => m !== undefined)

                return (
                  <li key={project.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {project.client} · due {formatDate(project.dueDate)}
                          {progress.overdue > 0 && (
                            <span className="ml-2 font-medium text-rose-600 dark:text-rose-400">
                              {progress.overdue} overdue
                            </span>
                          )}
                        </p>
                      </div>
                      <AvatarGroup members={members} max={3} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        percent={progress.percent}
                        label={`${progress.completed}/${progress.total} tasks`}
                        size="sm"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Upcoming deadlines
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Next 14 days, plus anything already late
          </p>

          {deadlines.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Nothing due in the next two weeks.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {deadlines.slice(0, 8).map((deadline) => (
                <li key={deadline.id}>
                  <Link
                    to={
                      deadline.kind === 'project'
                        ? `/projects/${deadline.projectId}`
                        : `/tasks/${deadline.taskId}`
                    }
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 transition hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-50/40"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {deadline.label}
                      </p>
                      <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {deadline.kind === 'project'
                          ? 'Project deadline'
                          : deadline.projectName}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        deadline.daysRemaining < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : deadline.daysRemaining <= 3
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {deadline.daysRemaining < 0
                        ? `${Math.abs(deadline.daysRemaining)}d late`
                        : deadline.daysRemaining === 0
                          ? 'Today'
                          : `${deadline.daysRemaining}d`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Tasks by status
          </h2>
          <ul className="mt-5 space-y-4">
            {statusBreakdown.map(({ status, count }) => (
              <li key={status}>
                <div className="mb-1.5 flex items-center justify-between">
                  <TaskStatusBadge status={status} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {count}
                  </span>
                </div>
                <ProgressBar
                  percent={
                    stats.totalTasks === 0
                      ? 0
                      : Math.round((count / stats.totalTasks) * 100)
                  }
                  size="sm"
                />
                <span className="sr-only">
                  {count} tasks in {taskStatusLabel[status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Nothing has happened yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivity.map((entry) => {
                const member = getMember(entry.memberId)
                const project = projects.find((p) => p.id === entry.projectId)

                return (
                  <li key={entry.id} className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        member?.color ?? 'bg-slate-300'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {member?.name ?? 'Someone'}
                        </span>{' '}
                        {entry.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {project ? `${project.name} · ` : ''}
                        {formatRelative(entry.timestamp)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Portfolio at a glance
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="pb-2 pr-4 font-medium">Project</th>
                <th scope="col" className="pb-2 pr-4 font-medium">Status</th>
                <th scope="col" className="pb-2 pr-4 font-medium">Tasks</th>
                <th scope="col" className="pb-2 pr-4 font-medium">Progress</th>
                <th scope="col" className="pb-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((project) => {
                const progress = calculateProgress(
                  tasksForProject(project.id),
                  project.dueDate,
                )
                return (
                  <tr key={project.id}>
                    <td className="py-3 pr-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      {progress.completed}/{progress.total}
                    </td>
                    <td className="w-40 py-3 pr-4">
                      <ProgressBar percent={progress.percent} size="sm" />
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {formatDate(project.dueDate)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function PageHeading() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Portfolio health across every project your team is running.
      </p>
    </div>
  )
}
