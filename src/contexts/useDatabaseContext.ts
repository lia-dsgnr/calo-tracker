/**
 * Hooks for accessing database context.
 * Separated from provider to satisfy react-refresh/only-export-components rule.
 */

import { useContext } from 'react'
import type { UserProfile } from '../db'
import { DatabaseContext, type DatabaseContextValue } from './databaseContextValue'

export type { DatabaseContextValue }

/**
 * Hook to access database context.
 * Must be used within a DatabaseProvider.
 */
export function useDatabaseContext(): DatabaseContextValue {
  const context = useContext(DatabaseContext)

  if (!context) {
    throw new Error(
      'useDatabaseContext must be used within a DatabaseProvider'
    )
  }

  return context
}

/**
 * Hook to get the current user.
 * Throws if no user is set (should not happen after initialisation).
 */
export function useCurrentUser(): UserProfile {
  const { currentUser } = useDatabaseContext()

  if (!currentUser) {
    throw new Error('No current user set')
  }

  return currentUser
}
