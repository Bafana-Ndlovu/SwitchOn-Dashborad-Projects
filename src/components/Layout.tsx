import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Modal } from './Modal'
import { Navbar } from './Navbar'
import { TaskForm } from './TaskForm'
import { useWorkspace } from '../hooks/useWorkspace'
import type { Task, TaskDraft } from '../types'

interface LayoutProps {
  children: ReactNode
}

/**
 * App shell: navigation, the global "New task" dialog, and the footer. Every
 * route renders inside it.
 */
export function Layout({ children }: LayoutProps) {
  const [creating, setCreating] = useState<boolean>(false)
  const { createTask, loading } = useWorkspace()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /** The scroll container, reset to the top whenever the route changes. */
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [pathname])

  const closeDialog = useCallback((): void => setCreating(false), [])

  function handleCreate(draft: TaskDraft): void {
    const task: Task = createTask(draft)
    setCreating(false)
    navigate(`/tasks/${task.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onNewTask={() => setCreating(true)} />

      <main ref={mainRef} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <Footer />

      <Modal open={creating} title="Create a task" onClose={closeDialog}>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading projects…
          </p>
        ) : (
          <TaskForm onSubmit={handleCreate} onCancel={closeDialog} />
        )}
      </Modal>
    </div>
  )
}
