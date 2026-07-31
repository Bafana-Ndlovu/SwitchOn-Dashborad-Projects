import { useMemo } from 'react'
import { useWorkspace } from './useWorkspace'
import { daysUntil, isOverdue } from '../utils/dates'
import type {
  DashboardStats,
  Deadline,
  Project,
  ProjectProgress,
  Task,
} from '../types'

/** A task counts as overdue when its deadline has passed and it is not done. */
export function isTaskOverdue(task: Task): boolean {
  return task.status !== 'completed' && isOverdue(task.dueDate)
}

/** Progress for one project, derived from its tasks rather than stored. */
export function calculateProgress(
  tasks: Task[],
  dueDate: string,
): ProjectProgress {
  const completed = tasks.filter((task) => task.status === 'completed').length
  const overdue = tasks.filter(isTaskOverdue).length

  return {
    total: tasks.length,
    completed,
    overdue,
    percent: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    daysRemaining: daysUntil(dueDate),
  }
}

/** Progress for a single project by id. */
export function useProjectProgress(projectId: string): ProjectProgress {
  const { tasksForProject, getProject } = useWorkspace()
  const project = getProject(projectId)
  const tasks = tasksForProject(projectId)

  return useMemo(
    () => calculateProgress(tasks, project?.dueDate ?? ''),
    [tasks, project?.dueDate],
  )
}

/** The headline numbers shown across the top of the dashboard. */
export function useDashboardStats(): DashboardStats {
  const { projects, tasks } = useWorkspace()

  return useMemo<DashboardStats>(() => {
    const completedTasks = tasks.filter(
      (task) => task.status === 'completed',
    ).length

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p: Project) => p.status === 'active')
        .length,
      completedProjects: projects.filter(
        (p: Project) => p.status === 'completed',
      ).length,
      onHoldProjects: projects.filter((p: Project) => p.status === 'on-hold')
        .length,
      totalTasks: tasks.length,
      completedTasks,
      overdueTasks: tasks.filter(isTaskOverdue).length,
      inProgressTasks: tasks.filter((task) => task.status === 'in-progress')
        .length,
      completionRate:
        tasks.length === 0
          ? 0
          : Math.round((completedTasks / tasks.length) * 100),
    }
  }, [projects, tasks])
}

/**
 * Project and task deadlines falling inside the next `withinDays` days, plus
 * anything already overdue, sorted soonest first.
 */
export function useUpcomingDeadlines(withinDays = 14): Deadline[] {
  const { projects, tasks } = useWorkspace()

  return useMemo<Deadline[]>(() => {
    const projectsById = new Map(projects.map((project) => [project.id, project]))
    const deadlines: Deadline[] = []

    for (const project of projects) {
      if (project.status === 'completed') continue
      const days = daysUntil(project.dueDate)
      if (days > withinDays) continue

      deadlines.push({
        id: `project-${project.id}`,
        kind: 'project',
        label: project.name,
        projectId: project.id,
        projectName: project.name,
        dueDate: project.dueDate,
        daysRemaining: days,
      })
    }

    for (const task of tasks) {
      if (task.status === 'completed') continue
      const days = daysUntil(task.dueDate)
      if (days > withinDays) continue

      const project = projectsById.get(task.projectId)
      if (!project || project.status === 'completed') continue

      deadlines.push({
        id: `task-${task.id}`,
        kind: 'task',
        label: task.title,
        projectId: task.projectId,
        projectName: project.name,
        taskId: task.id,
        dueDate: task.dueDate,
        daysRemaining: days,
      })
    }

    return deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [projects, tasks, withinDays])
}
