import { useEffect } from 'react'

/** Keeps the browser tab title in step with the current route. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · SwitchOn`
    return () => {
      document.title = previous
    }
  }, [title])
}
