import { Link } from 'react-router-dom'

interface FooterLink {
  label: string
  to: string
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const columns: FooterColumn[] = [
  {
    heading: 'Navigate',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Projects', to: '/projects' },
    ],
  },
  {
    heading: 'Projects',
    links: [
      { label: 'Active', to: '/projects?status=active' },
      { label: 'On hold', to: '/projects?status=on-hold' },
      { label: 'Completed', to: '/projects?status=completed' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4 lg:gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                S
              </span>
              <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                SwitchOn
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              A project management dashboard for tracking projects, tasks,
              deadlines and team workload in one place.
            </p>
          </div>

          {/*
            `lg:contents` lets the two link columns sit side by side on small
            screens while still joining the four-column grid on desktop.
          */}
          <div className="grid grid-cols-2 gap-8 lg:contents">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.label}`}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-500 dark:text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {year} SwitchOn · Project Management Dashboard
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Built by Melsoft Grok Team.
          </p>
        </div>
      </div>
    </footer>
  )
}
