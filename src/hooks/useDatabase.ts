/**
 * React hook for database operations.
 * Handles initialisation and provides access to repositories.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  setupDatabase,
  type MigrationResult,
  type UserProfile,
  getDefaultUser,
  createUser,
} from '../db'

interface DatabaseState {
  isInitialised: boolean
  isLoading: boolean
  error: string | null
  migrationResult: MigrationResult | null
  currentUser: UserProfile | null
}

interface UseDatabaseReturn extends DatabaseState {
  reinitialise: () => Promise<void>
  setCurrentUser: (user: UserProfile | null) => void
}

/**
 * Performs async database initialisation.
 * Extracted to avoid calling setState directly in effect.
 */
async function initialiseDatabaseAsync(): Promise<{
  migrationResult: MigrationResult | null
  user: UserProfile | null
}> {
  const migrationResult = await setupDatabase()
  let user = await getDefaultUser()

  if (!user) {
    user = await createUser('Default User')
  }

  return { migrationResult, user }
}

/**
 * Hook for managing database lifecycle.
 * Initialises database on mount, handles migration, sets up default user.
 */
export function useDatabase(): UseDatabaseReturn {
  const [state, setState] = useState<DatabaseState>({
    isInitialised: false,
    isLoading: true,
    error: null,
    migrationResult: null,
    currentUser: null,
  })

  useEffect(() => {
    let isMounted = true

    initialiseDatabaseAsync()
      .then(({ migrationResult, user }) => {
        if (isMounted) {
          setState({
            isInitialised: true,
            isLoading: false,
            error: null,
            migrationResult,
            currentUser: user,
          })
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to initialise database'
          setState({
            isInitialised: false,
            isLoading: false,
            error: errorMessage,
            migrationResult: null,
            currentUser: null,
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const reinitialise = useCallback(async () => {
    setState({
      isInitialised: false,
      isLoading: true,
      error: null,
      migrationResult: null,
      currentUser: null,
    })

    try {
      const { migrationResult, user } = await initialiseDatabaseAsync()

      setState({
        isInitialised: true,
        isLoading: false,
        error: null,
        migrationResult,
        currentUser: user,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialise database'
      setState({
        isInitialised: false,
        isLoading: false,
        error: errorMessage,
        migrationResult: null,
        currentUser: null,
      })
    }
  }, [])

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    setState((prev) => ({ ...prev, currentUser: user }))
  }, [])

  return {
    ...state,
    reinitialise,
    setCurrentUser,
  }
}
