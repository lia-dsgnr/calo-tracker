/**
 * Database context provider.
 * Makes database state and current user available throughout the app.
 */

import type { ReactNode } from 'react'
import { useDatabase } from '../hooks/useDatabase'
import { DatabaseContext } from './databaseContextValue'

interface DatabaseProviderProps {
  children: ReactNode
  /** Optional loading component while database initialises */
  loadingFallback?: ReactNode
  /** Optional error component when database fails to initialise */
  errorFallback?: (error: string) => ReactNode
}

/**
 * Provider component that initialises the database and provides context.
 */
export function DatabaseProvider({
  children,
  loadingFallback,
  errorFallback,
}: DatabaseProviderProps) {
  const database = useDatabase()

  // Show loading state while database initialises
  if (database.isLoading) {
    return (
      <>
        {loadingFallback ?? (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  // Show error state if initialisation failed
  if (database.error) {
    return (
      <>
        {errorFallback?.(database.error) ?? (
          <div className="flex h-screen items-center justify-center p-4">
            <div className="text-center">
              <p className="mb-2 text-destructive font-medium">
                Database Error
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {database.error}
              </p>
              <button
                onClick={database.reinitialise}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}
