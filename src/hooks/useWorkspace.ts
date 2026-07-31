import { useContext } from 'react'
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from '../context/workspace-context'

/**
 * Typed access to the workspace context. Throwing here means components never
 * have to null-check the context value.
 */
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)

  if (context === null) {
    throw new Error('useWorkspace must be used inside a <WorkspaceProvider>.')
  }

  return context
}
