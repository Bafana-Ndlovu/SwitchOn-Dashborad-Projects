import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stopped changing for `delay` ms. Keeps the
 * project list from re-filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
