import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useWorkspace } from '../hooks/useWorkspace'

interface NavbarProps {
  onNewTask: () => void
}

const links: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
]

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
  ].join(' ')
}

export function Navbar({ onNewTask }: NavbarProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { hasLocalChanges, resetWorkspace } = useWorkspace()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            S
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            SwitchOn
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {hasLocalChanges && (
            <button
              type="button"
              onClick={resetWorkspace}
              title="Discard locally saved tasks and reload the original data"
              className="hidden rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:block"
            >
              Reset demo data
            </button>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={onNewTask}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <span aria-hidden="true">＋</span> New task
          </button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((previous) => !previous)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 md:hidden"
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}
            {hasLocalChanges && (
              <button
                type="button"
                onClick={() => {
                  resetWorkspace()
                  setOpen(false)
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reset demo data
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
