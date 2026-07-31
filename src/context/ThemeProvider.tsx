import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme, type ThemeContextValue } from './theme-context'

const STORAGE_KEY = 'switchon.theme.v1'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Owns the light/dark decision for the whole app.
 *
 * With no saved choice the app follows the operating system and keeps following
 * it if the user changes that setting while the tab is open. Picking a theme in
 * the header saves it and takes over from then on.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [stored, setStored] = useState<Theme | null>(() => readStoredTheme())
  const [system, setSystem] = useState<Theme>(() => systemTheme())

  const theme: Theme = stored ?? system

  // Track the OS setting so an unsaved preference stays in step with it.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)

    function handleChange(event: MediaQueryListEvent): void {
      setSystem(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  // The single place the class is written to the document.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setTheme = useCallback((next: Theme): void => {
    setStored(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage blocked — the choice still applies for this session.
    }
  }, [])

  const toggleTheme = useCallback((): void => {
    setStored((previous) => {
      const next: Theme = (previous ?? systemTheme()) === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // See above.
      }
      return next
    })
  }, [])

  const useSystemTheme = useCallback((): void => {
    setStored(null)
    setSystem(systemTheme())
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // See above.
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      followsSystem: stored === null,
      setTheme,
      toggleTheme,
      useSystemTheme,
    }),
    [theme, stored, setTheme, toggleTheme, useSystemTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
