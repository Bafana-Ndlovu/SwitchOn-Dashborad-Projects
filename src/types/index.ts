/**
 * Shared domain types for the SwitchOn dashboard.
 *
 * Every entity that crosses a component boundary is described here so props,
 * event handlers and context values can all be typed against one source.
 */

export type ProjectStatus = 'active' | 'on-hold' | 'completed'

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'completed'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  /** Tailwind background class used for the member's avatar chip. */
  color: string
}

export interface Project {
  id: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  /** ISO date, e.g. "2026-03-02". */
  startDate: string
  dueDate: string
  memberIds: string[]
  tags: string[]
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  /** `null` means the task has not been assigned to anyone yet. */
  assigneeId: string | null
  dueDate: string
  createdAt: string
}

export interface ActivityEntry {
  id: string
  projectId: string
  memberId: string
  message: string
  /** ISO timestamp. */
  timestamp: string
}

/** The shape returned by the mock API in one go. */
export interface Workspace {
  projects: Project[]
  tasks: Task[]
  members: TeamMember[]
  activity: ActivityEntry[]
}

/** Fields the user supplies when creating a task through the form. */
export interface TaskDraft {
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assigneeId: string | null
  dueDate: string
}

/** Aggregate numbers rendered on the dashboard. */
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  inProgressTasks: number
  completionRate: number
}

export interface ProjectProgress {
  total: number
  completed: number
  overdue: number
  percent: number
  /** Days until the due date; negative once the deadline has passed. */
  daysRemaining: number
}

/** A project or task deadline surfaced in the "Upcoming deadlines" panel. */
export interface Deadline {
  id: string
  kind: 'project' | 'task'
  label: string
  projectId: string
  projectName: string
  taskId?: string
  dueDate: string
  daysRemaining: number
}

/** Every state a fetch can be in, so pages can render all three branches. */
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
