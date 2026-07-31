import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * `useState` that mirrors its value into localStorage, so tasks the user
 * creates or moves survive a page refresh. Falls back to in-memory state if
 * storage is unavailable (private browsing, quota exceeded).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((previous: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : (JSON.parse(stored) as T)
    } catch {
      return initialValue
    }
  })

  /**
   * Whatever we read from storage on mount. While the state still holds that
   * exact value there is nothing new to write, so the mount pass is skipped.
   */
  const persisted = useRef<T>(value)

  useEffect(() => {
    if (value === persisted.current) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      persisted.current = value
    } catch {
      // Storage is full or blocked — the app still works, just without persistence.
    }
  }, [key, value])

  const clear = useCallback((): void => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore — see above.
    }
    persisted.current = initialValue
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, clear]
}
