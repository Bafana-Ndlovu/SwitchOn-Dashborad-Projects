import { useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { PriorityBadge, TaskStatusBadge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews'
import { TaskForm } from '../components/TaskForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWorkspace } from '../hooks/useWorkspace'
import { isTaskOverdue } from '../hooks/useStats'
import { describeDeadline, formatDate } from '../utils/dates'
import {
  PRIORITIES,
  TASK_STATUSES,
  nextStatus,
  priorityLabel,
  taskStatusLabel,
} from '../utils/labels'
import type { Priority, TaskDraft, TaskStatus } from '../types'

export default function TaskDetail() {
  const { taskId = '' } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const {
    loading,
    error,
    reload,
    getTask,
    getProject,
    getMember,
    members,
    setTaskStatus,
    updateTask,
  } = useWorkspace()

  const task = getTask(taskId)
  const [editing, setEditing] = useState<boolean>(false)

  useDocumentTitle(task?.title ?? 'Task')

  if (loading) return <LoadingState label="Loading task…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  if (!task) {
    return (
      <EmptyState
        icon="🔎"
        title="Task not found"
        description={`No task matches the id "${taskId}".`}
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

  const project = getProject(task.projectId)
  const assignee = getMember(task.assigneeId)
  const overdue = isTaskOverdue(task)
  const advanceTo = nextStatus(task.status)

  // Arrow functions rather than declarations: TypeScript keeps the "task is
  // defined" narrowing from the guard above inside them.
  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setTaskStatus(task.id, event.target.value as TaskStatus)
  }

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    updateTask(task.id, { priority: event.target.value as Priority })
  }

  const handleAssigneeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value
    updateTask(task.id, { assigneeId: value === '' ? null : value })
  }

  const handleDueDateChange = (event: ChangeEvent<HTMLInputElement>): void => {
    updateTask(task.id, { dueDate: event.target.value })
  }

  const handleEdit = (draft: TaskDraft): void => {
    updateTask(task.id, draft)
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link to="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Projects
        </Link>
        <span className="mx-2 text-slate-500 dark:text-slate-400">/</span>
        {project ? (
          <Link to={`/projects/${project.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {project.name}
          </Link>
        ) : (
          <span>Unknown project</span>
        )}
        <span className="mx-2 text-slate-500 dark:text-slate-400">/</span>
        <span className="text-slate-700 dark:text-slate-300">Task</span>
      </nav>

      <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {overdue && (
              <span className="rounded-full bg-rose-100 dark:bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-200 dark:ring-rose-500/30">
                Overdue
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Edit task
          </button>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {task.title}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {task.description.trim() === '' ? (
            <span className="italic text-slate-500 dark:text-slate-400">
              No description was added for this task.
            </span>
          ) : (
            task.description
          )}
        </p>

        <dl className="mt-8 grid gap-6 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Project
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {project ? (
                <Link
                  to={`/projects/${project.id}`}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {project.name}
                </Link>
              ) : (
                'Unknown'
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Created
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(task.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Assignee
            </dt>
            <dd className="mt-1.5 flex items-center gap-2">
              <Avatar member={assignee} size="sm" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {assignee ? assignee.name : 'Unassigned'}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Deadline
            </dt>
            <dd
              className={`mt-1.5 text-sm font-semibold ${
                overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {formatDate(task.dueDate)} · {describeDeadline(task.dueDate)}
            </dd>
          </div>
        </dl>
      </article>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Update</h2>
          {advanceTo && (
            <button
              type="button"
              onClick={() => setTaskStatus(task.id, advanceTo)}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Move to {taskStatusLabel[advanceTo]} →
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </span>
            <select
              value={task.status}
              onChange={handleStatusChange}
              className={fieldClass}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {taskStatusLabel[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
            </span>
            <select
              value={task.priority}
              onChange={handlePriorityChange}
              className={fieldClass}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabel[priority]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Assignee
            </span>
            <select
              value={task.assigneeId ?? ''}
              onChange={handleAssigneeChange}
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Due date
            </span>
            <input
              type="date"
              value={task.dueDate}
              onChange={handleDueDateChange}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ← Back
          </button>
          {project && (
            <Link
              to={`/projects/${project.id}`}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Open project
            </Link>
          )}
        </div>
      </section>

      <Modal open={editing} title="Edit task" onClose={() => setEditing(false)}>
        <TaskForm
          submitLabel="Save changes"
          initialValues={{
            projectId: task.projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId ?? '',
            dueDate: task.dueDate,
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  )
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40'
