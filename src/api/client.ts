import type {
  ActivityEntry,
  Project,
  Task,
  TeamMember,
  Workspace,
} from '../types'

/**
 * The mock API. The four JSON documents in `public/api/` are served as static
 * files by Vite in development and by Vercel in production, so the app talks to
 * them over `fetch` exactly as it would to a real HTTP endpoint.
 */
const BASE_URL = '/api'

/** Artificial latency so the loading states are actually visible. */
const LATENCY_MS = 700

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

async function getJson<T>(resource: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}/${resource}.json`, { signal })

  if (!response.ok) {
    throw new Error(
      `Could not load ${resource} (${response.status} ${response.statusText})`,
    )
  }

  return (await response.json()) as T
}

/**
 * Loads the whole workspace in one call. The four requests run in parallel, and
 * an aborted request (component unmounted, route changed) rejects rather than
 * resolving with partial data.
 */
export async function fetchWorkspace(signal?: AbortSignal): Promise<Workspace> {
  const [projects, tasks, members, activity] = await Promise.all([
    getJson<Project[]>('projects', signal),
    getJson<Task[]>('tasks', signal),
    getJson<TeamMember[]>('members', signal),
    getJson<ActivityEntry[]>('activity', signal),
    delay(LATENCY_MS),
  ])

  return { projects, tasks, members, activity }
}
