import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  /** The theme currently applied to the document. */
  theme: Theme
  /** True when the theme is following the operating system rather than a saved choice. */
  followsSystem: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  /** Forgets the saved choice and follows the operating system again. */
  useSystemTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
