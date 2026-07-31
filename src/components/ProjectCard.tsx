import { Link } from 'react-router-dom'
import { AvatarGroup } from './Avatar'
import { ProjectStatusBadge } from './Badge'
import { ProgressBar } from './ProgressBar'
import { useWorkspace } from '../hooks/useWorkspace'
import { calculateProgress } from '../hooks/useStats'
import { describeDeadline, formatDate } from '../utils/dates'
import type { Project, TeamMember } from '../types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { tasksForProject, getMember } = useWorkspace()
  const tasks = tasksForProject(project.id)
  const progress = calculateProgress(tasks, project.dueDate)

  const members = project.memberIds
    .map(getMember)
    .filter((member): member is TeamMember => member !== undefined)

  const behind = progress.daysRemaining < 0 && project.status !== 'completed'

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {project.client}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
            {project.name}
          </h3>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
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

      <div className="mt-5">
        <ProgressBar
          percent={progress.percent}
          label={`${progress.completed} of ${progress.total} tasks`}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <AvatarGroup members={members} />
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(project.dueDate)}</p>
          <p
            className={`text-xs font-medium ${
              behind ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {project.status === 'completed'
              ? 'Delivered'
              : describeDeadline(project.dueDate)}
          </p>
        </div>
      </div>
    </Link>
  )
}
