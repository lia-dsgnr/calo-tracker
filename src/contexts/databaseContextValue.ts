/**
 * Database context value type and context object.
 * Separated to satisfy react-refresh requirements.
 */

import { createContext } from 'react'
import type { UserProfile, MigrationResult } from '../db'

export interface DatabaseContextValue {
  isInitialised: boolean
  isLoading: boolean
  error: string | null
  migrationResult: MigrationResult | null
  currentUser: UserProfile | null
  setCurrentUser: (user: UserProfile | null) => void
  reinitialise: () => Promise<void>
}

export const DatabaseContext = createContext<DatabaseContextValue | null>(null)
