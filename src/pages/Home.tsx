import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useWorkspace } from '../hooks/useWorkspace'
import { useDashboardStats } from '../hooks/useStats'

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'One view of everything',
    description:
      'Project counts, task throughput, overdue work and the next two weeks of deadlines on a single screen.',
  },
  {
    icon: '🔍',
    title: 'Find work fast',
    description:
      'Search by name, client or tag and filter by status, then sort by deadline or progress.',
  },
  {
    icon: '✅',
    title: 'Move tasks along',
    description:
      'Create tasks, set priorities, assign owners and walk each one from To Do to Completed.',
  },
  {
    icon: '💾',
    title: 'Changes stick',
    description:
      'Anything you create or edit is saved to this browser, so a refresh never loses your work.',
  },
]

export default function Home() {
  useDocumentTitle('Home')
  const { loading } = useWorkspace()
  const stats = useDashboardStats()

  return (
    <div className="space-y-16">
      {/* The hero keeps its brand gradient in both themes, just deepened for dark. */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-14 text-white sm:px-10 sm:py-20 dark:from-indigo-800 dark:via-indigo-800 dark:to-violet-900">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">
          SwitchOn Workspace
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Every project, task and deadline your team is carrying — in one place.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-indigo-100 sm:text-lg">
          SwitchOn pulls the whole portfolio into a single dashboard so you can see
          what is on track, what is slipping and what needs a decision today.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Open the dashboard
          </Link>
          <Link
            to="/projects"
            className="rounded-xl border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Browse projects
          </Link>
        </div>

        <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: 'Projects', value: stats.totalProjects },
            { label: 'Active', value: stats.activeProjects },
            { label: 'Tasks', value: stats.totalTasks },
            { label: 'Completed', value: stats.completedTasks },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs uppercase tracking-wide text-indigo-100">
                {item.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold sm:text-3xl">
                {loading ? '—' : item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          What you can do here
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-2xl" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}
