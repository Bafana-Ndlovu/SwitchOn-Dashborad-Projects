import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

/**
 * Switches between light and dark. Before the user picks either, the app is
 * following the operating system — the title says so, and a double-click on the
 * button hands control back to the system setting
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, followsSystem, toggleTheme, useSystemTheme } = useTheme()
  const goingTo = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onDoubleClick={useSystemTheme}
      aria-pressed={theme === 'dark'}
      title={
        followsSystem
          ? `Following your system theme (${theme}). Click for ${goingTo} mode.`
          : `Switch to ${goingTo} mode. Double-click to follow your system again.`
      }
      className={`rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
      <span className="sr-only">Switch to {goingTo} mode</span>
    </button>
  )
}
