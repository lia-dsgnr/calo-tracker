import { useCallback, useEffect, useState } from 'react'

/**
 * Generic hook to sync React state with localStorage.
 * Persists state across page refreshes for client-side data persistence.
 * 
 * Simplified MVP version: no cross-tab sync, no schema versioning.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage or fallback to default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      // Handle corrupted localStorage data gracefully
      return initialValue
    }
  })

  // Persist changes to localStorage whenever state updates
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Storage quota exceeded or private browsing mode - fail silently
    }
  }, [key, storedValue])

  // Wrapper to support functional updates (like useState)
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value
      return nextValue
    })
  }, [])

  return [storedValue, setValue]
}
