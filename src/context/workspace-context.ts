import { createContext } from 'react'
import type {
  ActivityEntry,
  Project,
  Task,
  TaskDraft,
  TaskStatus,
  TeamMember,
} from '../types'

export interface WorkspaceContextValue {
  /** True while the initial fetch is in flight. */
  loading: boolean
  /** Non-null when the fetch failed; pages render an error state from it. */
  error: string | null
  /** Retries the fetch. */
  reload: () => void

  projects: Project[]
  tasks: Task[]
  members: TeamMember[]
  activity: ActivityEntry[]

  getProject: (projectId: string) => Project | undefined
  getTask: (taskId: string) => Task | undefined
  getMember: (memberId: string | null) => TeamMember | undefined
  tasksForProject: (projectId: string) => Task[]
  activityForProject: (projectId: string) => ActivityEntry[]

  createTask: (draft: TaskDraft) => Task
  updateTask: (taskId: string, changes: Partial<TaskDraft>) => void
  setTaskStatus: (taskId: string, status: TaskStatus) => void

  /** True once the user has created or edited anything in this browser. */
  hasLocalChanges: boolean
  /** Throws away local edits and returns to the data served by the mock API. */
  resetWorkspace: () => void
}

/**
 * Deliberately created with `null` so `useWorkspace` can throw a useful error
 * when a component is rendered outside the provider.
 */
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)
