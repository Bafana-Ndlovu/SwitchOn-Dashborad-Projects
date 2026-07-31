import { useCallback, useEffect, useState } from 'react'
import type { AsyncState } from '../types'

export interface UseFetchResult<T> extends AsyncState<T> {
  /** Re-runs the request — wired to the "Try again" button on the error state. */
  reload: () => void
}

/**
 * Generic data-fetching hook. Owns the loading / error / data triple so no page
 * has to hand-roll it, and aborts the request if the component unmounts before
 * the response lands.
 *
 * `fetcher` must be stable (defined at module scope or memoised by the caller),
 * because it is part of the effect's dependency list.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
): UseFetchResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [attempt, setAttempt] = useState<number>(0)

  const reload = useCallback((): void => {
    setAttempt((previous) => previous + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setState({ data: null, loading: true, error: null })

    fetcher(controller.signal)
      .then((data: T) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return
        const message =
          error instanceof Error
            ? error.message
            : 'Something went wrong while loading the workspace.'
        setState({ data: null, loading: false, error: message })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [fetcher, attempt])

  return { ...state, reload }
}
