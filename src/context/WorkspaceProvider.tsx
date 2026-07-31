import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { fetchWorkspace } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { taskStatusLabel } from '../utils/labels'
import type {
  ActivityEntry,
  Project,
  Task,
  TaskDraft,
  TaskStatus,
  TeamMember,
  Workspace,
} from '../types'
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-context'

const STORAGE_KEY = 'switchon.workspace.v1'

/** The slice of the workspace the user can change, and that we persist. */
interface LocalEdits {
  tasks: Task[]
  activity: ActivityEntry[]
}

const NO_EDITS: LocalEdits | null = null

const EMPTY_PROJECTS: Project[] = []
const EMPTY_TASKS: Task[] = []
const EMPTY_MEMBERS: TeamMember[] = []
const EMPTY_ACTIVITY: ActivityEntry[] = []

/** The signed-in user, hard-coded because there is no authentication. */
const CURRENT_USER_ID = 'm1'

interface WorkspaceProviderProps {
  children: ReactNode
}

/**
 * Fetches the workspace once, layers any locally-created or edited tasks on top
 * of it, and shares the result with every route through context.
 */
export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { data, loading, error, reload } = useFetch<Workspace>(fetchWorkspace)
  const [edits, setEdits, clearEdits] = useLocalStorage<LocalEdits | null>(
    STORAGE_KEY,
    NO_EDITS,
  )

  const projects = data?.projects ?? EMPTY_PROJECTS
  const members = data?.members ?? EMPTY_MEMBERS
  const tasks = edits?.tasks ?? data?.tasks ?? EMPTY_TASKS
  const activity = edits?.activity ?? data?.activity ?? EMPTY_ACTIVITY

  /**
   * The fetched baseline, read inside state updaters that run long after the
   * render that queued them — a ref is the only way to see the current value
   * there without making every callback depend on the data.
   */
  const baseline = useRef<LocalEdits>({ tasks, activity })
  baseline.current = { tasks, activity }

  /** Applies a change to the editable slice and persists the result. */
  const mutate = useCallback(
    (change: (current: LocalEdits) => LocalEdits): void => {
      setEdits((previous) => change(previous ?? baseline.current))
    },
    [setEdits],
  )

  const logActivity = useCallback(
    (projectId: string, message: string): ActivityEntry => ({
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      projectId,
      memberId: CURRENT_USER_ID,
      message,
      timestamp: new Date().toISOString(),
    }),
    [],
  )

  const createTask = useCallback(
    (draft: TaskDraft): Task => {
      const task: Task = {
        ...draft,
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString().slice(0, 10),
      }

      mutate((current) => ({
        tasks: [task, ...current.tasks],
        activity: [
          logActivity(task.projectId, `created "${task.title}"`),
          ...current.activity,
        ],
      }))

      return task
    },
    [logActivity, mutate],
  )

  const updateTask = useCallback(
    (taskId: string, changes: Partial<TaskDraft>): void => {
      mutate((current) => {
        const target = current.tasks.find((task) => task.id === taskId)
        if (!target) return current

        return {
          tasks: current.tasks.map((task) =>
            task.id === taskId ? { ...task, ...changes } : task,
          ),
          activity: [
            logActivity(target.projectId, `updated "${target.title}"`),
            ...current.activity,
          ],
        }
      })
    },
    [logActivity, mutate],
  )

  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus): void => {
      mutate((current) => {
        const target = current.tasks.find((task) => task.id === taskId)
        if (!target || target.status === status) return current

        const verb =
          status === 'completed'
            ? `completed "${target.title}"`
            : `moved "${target.title}" to ${taskStatusLabel[status]}`

        return {
          tasks: current.tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          ),
          activity: [logActivity(target.projectId, verb), ...current.activity],
        }
      })
    },
    [logActivity, mutate],
  )

  /** Index lookups, rebuilt only when the underlying collection changes. */
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  )
  const tasksById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  )
  const membersById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      loading,
      error,
      reload,
      projects,
      tasks,
      members,
      activity,
      getProject: (projectId) => projectsById.get(projectId),
      getTask: (taskId) => tasksById.get(taskId),
      getMember: (memberId) =>
        memberId === null ? undefined : membersById.get(memberId),
      tasksForProject: (projectId) =>
        tasks.filter((task) => task.projectId === projectId),
      activityForProject: (projectId) =>
        activity
          .filter((entry) => entry.projectId === projectId)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      createTask,
      updateTask,
      setTaskStatus,
      hasLocalChanges: edits !== null,
      resetWorkspace: clearEdits,
    }),
    [
      loading,
      error,
      reload,
      projects,
      tasks,
      members,
      activity,
      projectsById,
      tasksById,
      membersById,
      createTask,
      updateTask,
      setTaskStatus,
      edits,
      clearEdits,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
