import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      {/* A watermark, not content — the heading below carries the message. */}
      <p
        aria-hidden="true"
        className="text-6xl font-bold text-slate-300 dark:text-slate-700"
      >
        404
      </p>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        The link may be out of date, or the project or task it pointed at no
        longer exists.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link
          to="/dashboard"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Go to the dashboard
        </Link>
        <Link
          to="/projects"
          className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Browse projects
        </Link>
      </div>
    </div>
  )
}
