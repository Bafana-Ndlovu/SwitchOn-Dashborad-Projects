import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '../context/theme-context'

/** Typed access to the theme context. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === null) {
    throw new Error('useTheme must be used inside a <ThemeProvider>.')
  }

  return context
}
