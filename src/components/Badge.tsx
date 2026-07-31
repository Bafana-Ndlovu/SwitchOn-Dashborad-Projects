import type { ReactNode } from 'react'
import type { Priority, ProjectStatus, TaskStatus } from '../types'
import {
  priorityLabel,
  priorityStyles,
  projectStatusLabel,
  projectStatusStyles,
  taskStatusLabel,
  taskStatusStyles,
} from '../utils/labels'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  )
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={taskStatusStyles[status]}>{taskStatusLabel[status]}</Badge>
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge className={projectStatusStyles[status]}>
      {projectStatusLabel[status]}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={priorityStyles[priority]}>{priorityLabel[priority]}</Badge>
}
