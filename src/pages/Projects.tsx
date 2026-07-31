import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from '../components/StateViews'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWorkspace } from '../hooks/useWorkspace'
import { calculateProgress } from '../hooks/useStats'
import { PROJECT_STATUSES, projectStatusLabel } from '../utils/labels'
import type { Project, ProjectStatus } from '../types'

type StatusFilter = ProjectStatus | 'all'
type SortKey = 'deadline' | 'progress' | 'name'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'progress', label: 'Progress (lowest)' },
  { value: 'name', label: 'Name (A–Z)' },
]

function isStatusFilter(value: string | null): value is StatusFilter {
  return (
    value === 'all' ||
    (value !== null && PROJECT_STATUSES.includes(value as ProjectStatus))
  )
}

export default function Projects() {
  useDocumentTitle('Projects')

  const { loading, error, reload, projects, tasksForProject } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusParam = searchParams.get('status')
  const status: StatusFilter = isStatusFilter(statusParam) ? statusParam : 'all'

  const [query, setQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortKey>('deadline')
  const debouncedQuery = useDebouncedValue(query, 250)

  /**
   * Practical use of a ref: pressing "/" anywhere on the page jumps straight
   * into the search box, the way it works in GitHub or Linear.
   */
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement | null
      const typingElsewhere =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement

      if (event.key === '/' && !typingElsewhere) {
        event.preventDefault()
        searchRef.current?.focus()
      }

      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('')
        searchRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleStatusChange(next: StatusFilter): void {
    const params = new URLSearchParams(searchParams)
    if (next === 'all') {
      params.delete('status')
    } else {
      params.set('status', next)
    }
    setSearchParams(params, { replace: true })
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSortBy(event.target.value as SortKey)
  }

  const visible = useMemo<Project[]>(() => {
    const needle = debouncedQuery.trim().toLowerCase()

    const filtered = projects.filter((project) => {
      if (status !== 'all' && project.status !== status) return false
      if (needle === '') return true

      return (
        project.name.toLowerCase().includes(needle) ||
        project.client.toLowerCase().includes(needle) ||
        project.description.toLowerCase().includes(needle) ||
        project.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'deadline') return a.dueDate.localeCompare(b.dueDate)

      const progressA = calculateProgress(tasksForProject(a.id), a.dueDate).percent
      const progressB = calculateProgress(tasksForProject(b.id), b.dueDate).percent
      return progressA - progressB
    })
  }, [projects, status, debouncedQuery, sortBy, tasksForProject])

  const counts = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      'on-hold': projects.filter((p) => p.status === 'on-hold').length,
      completed: projects.filter((p) => p.status === 'completed').length,
    }),
    [projects],
  )

  const filtersApplied = status !== 'all' || debouncedQuery.trim() !== ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? 'Loading the portfolio…'
              : `${visible.length} of ${projects.length} projects shown`}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            >
              🔍
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
              placeholder="Search by name, client, description or tag…"
              aria-label="Search projects"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-16 text-sm transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:block">
              /
            </kbd>
          </div>

          <label className="sm:w-56">
            <span className="sr-only">Sort projects</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {(['all', ...PROJECT_STATUSES] as StatusFilter[]).map((option) => {
            const selected = status === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => handleStatusChange(option)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  selected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {option === 'all' ? 'All' : projectStatusLabel[option]}
                <span
                  className={`ml-1.5 text-xs ${
                    selected
                      ? 'text-indigo-100'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts[option]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <CardGridSkeleton count={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={filtersApplied ? '🔍' : '📁'}
          title={
            filtersApplied ? 'No projects match your filters' : 'No projects yet'
          }
          description={
            filtersApplied
              ? 'Try a different search term, or clear the status filter to see everything.'
              : 'Once projects are added to the workspace they will show up here.'
          }
          action={
            filtersApplied ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  handleStatusChange('all')
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
