import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import { todayIso } from '../utils/dates'
import {
  PRIORITIES,
  TASK_STATUSES,
  priorityLabel,
  taskStatusLabel,
} from '../utils/labels'
import type { Priority, TaskDraft, TaskStatus } from '../types'

/** Every field is a string while it lives in the form. */
interface FormValues {
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assigneeId: string
  dueDate: string
}

/** One optional message per field, keyed by field name. */
type FormErrors = Partial<Record<keyof FormValues, string>>

interface TaskFormProps {
  /** Pre-selects a project and hides nothing — the user can still change it. */
  defaultProjectId?: string
  /** Populates the form for an edit instead of a create. */
  initialValues?: Partial<FormValues>
  submitLabel?: string
  onSubmit: (draft: TaskDraft) => void
  onCancel: () => void
}

const TITLE_MIN = 5
const TITLE_MAX = 90
const DESCRIPTION_MAX = 400

/**
 * @param earliestDueDate The oldest date the form will accept — today for a new
 *   task, or the task's existing date when that is already in the past.
 */
function runValidation(
  values: FormValues,
  earliestDueDate: string,
): FormErrors {
  const errors: FormErrors = {}

  if (!values.projectId) {
    errors.projectId = 'Choose the project this task belongs to.'
  }

  const title = values.title.trim()
  if (title.length === 0) {
    errors.title = 'A title is required.'
  } else if (title.length < TITLE_MIN) {
    errors.title = `Give the task at least ${TITLE_MIN} characters so it is recognisable.`
  } else if (title.length > TITLE_MAX) {
    errors.title = `Keep the title under ${TITLE_MAX} characters.`
  }

  if (values.description.length > DESCRIPTION_MAX) {
    errors.description = `Descriptions are capped at ${DESCRIPTION_MAX} characters.`
  }

  if (!values.dueDate) {
    errors.dueDate = 'Pick a due date.'
  } else if (values.dueDate < earliestDueDate) {
    errors.dueDate = 'The due date cannot be in the past.'
  }

  return errors
}

/**
 * A fully controlled form: React state is the single source of truth for every
 * input, and validation runs on submit and again on each change once a field
 * has already been flagged.
 */
export function TaskForm({
  defaultProjectId = '',
  initialValues,
  submitLabel = 'Create task',
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const { projects, members } = useWorkspace()

  const [values, setValues] = useState<FormValues>({
    projectId: initialValues?.projectId ?? defaultProjectId,
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    status: initialValues?.status ?? 'todo',
    priority: initialValues?.priority ?? 'medium',
    assigneeId: initialValues?.assigneeId ?? '',
    dueDate: initialValues?.dueDate ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState<boolean>(false)

  const openProjects = projects.filter(
    (project) => project.status !== 'completed',
  )

  const today = todayIso()
  const earliestDueDate =
    initialValues?.dueDate && initialValues.dueDate < today
      ? initialValues.dueDate
      : today

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target
    const next: FormValues = { ...values, [name]: value }
    setValues(next)
    if (submitted) setErrors(runValidation(next, earliestDueDate))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setSubmitted(true)

    const found = runValidation(values, earliestDueDate)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({
      projectId: values.projectId,
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId === '' ? null : values.assigneeId,
      dueDate: values.dueDate,
    })
  }

  const invalid = Object.keys(errors).length > 0

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <Field label="Task title" htmlFor="title" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          data-autofocus
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Wire the payments confirmation screen"
          aria-invalid={Boolean(errors.title)}
          className={inputClass(Boolean(errors.title))}
        />
      </Field>

      <Field label="Project" htmlFor="projectId" error={errors.projectId}>
        <select
          id="projectId"
          name="projectId"
          value={values.projectId}
          onChange={handleChange}
          aria-invalid={Boolean(errors.projectId)}
          className={inputClass(Boolean(errors.projectId))}
        >
          <option value="">Select a project…</option>
          {openProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description}
        hint={`${values.description.length}/${DESCRIPTION_MAX}`}
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={handleChange}
          placeholder="What does done look like?"
          aria-invalid={Boolean(errors.description)}
          className={inputClass(Boolean(errors.description))}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
            className={inputClass(false)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabel[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority" htmlFor="priority">
          <select
            id="priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            className={inputClass(false)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel[priority]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Assignee" htmlFor="assigneeId">
          <select
            id="assigneeId"
            name="assigneeId"
            value={values.assigneeId}
            onChange={handleChange}
            className={inputClass(false)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} — {member.role}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date" htmlFor="dueDate" error={errors.dueDate}>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            min={earliestDueDate}
            value={values.dueDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dueDate)}
            className={inputClass(Boolean(errors.dueDate))}
          />
        </Field>
      </div>

      {submitted && invalid && (
        <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
          Please fix the highlighted fields before saving.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2',
    hasError
      ? 'border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-500/40'
      : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-500/40',
  ].join(' ')
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        {hint && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  )
}
