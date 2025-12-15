/**
 * Domain-specific storage hook for Calo Tracker.
 * Provides a unified interface for managing logs, recent items, and goals.
 * Components use this instead of directly accessing localStorage.
 */

import { useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import {
  STORAGE_KEYS,
  DEFAULT_GOALS,
  createLogEntry,
  addLogEntry,
  removeLogEntry,
  getTodayLogs,
  calculateDailyTotals,
  pruneOldLogs,
  migrateLogs,
} from '../lib/storage'
import foodsData from '../data/foods.json'
import type { DailyGoals, LogEntry, RecentItem, PortionSize, FoodItem, DailySummary } from '../types'

interface UseCaloStorageReturn {
  // State
  logs: LogEntry[]
  todayLogs: LogEntry[]
  recentItems: RecentItem[]
  goals: DailyGoals
  dailySummary: DailySummary
  
  // Actions
  addFood: (food: FoodItem, portion: PortionSize) => LogEntry
  removeLog: (entryId: string) => void
  undoLastLog: () => LogEntry | null
  clearTodayLogs: () => void
  pruneOldData: (daysToKeep?: number) => void
}

/**
 * Main storage hook for the Calo Tracker app.
 * Manages all localStorage state with derived values and actions.
 */
export function useCaloStorage(): UseCaloStorageReturn {
  // Core persisted state
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(STORAGE_KEYS.LOGS, [])
  const [recentItems, setRecentItems] = useLocalStorage<RecentItem[]>(STORAGE_KEYS.RECENT, [])
  const [storedGoals] = useLocalStorage<Partial<DailyGoals>>(STORAGE_KEYS.GOALS, DEFAULT_GOALS)

  // Merge stored goals with defaults to handle missing fields from legacy data
  const goals: DailyGoals = useMemo(
    () => ({ ...DEFAULT_GOALS, ...storedGoals }),
    [storedGoals]
  )

  // Track if migration has run to avoid repeated migrations
  const hasMigrated = useRef(false)

  // Migrate legacy logs on first render (backfill carbs/fat)
  useEffect(() => {
    if (hasMigrated.current || logs.length === 0) return

    const needsMigration = logs.some(
      (log) => log.carbs === undefined || log.fat === undefined
    )

    if (needsMigration) {
      const migratedLogs = migrateLogs(logs, foodsData.foods as FoodItem[])
      setLogs(migratedLogs)
    }

    hasMigrated.current = true
  }, [logs, setLogs])

  // Derived values - memoized to prevent unnecessary recalculations
  const todayLogs = useMemo(() => getTodayLogs(logs), [logs])
  
  const dailyTotals = useMemo(
    () => calculateDailyTotals(logs, goals),
    [logs, goals]
  )

  const dailySummary: DailySummary = useMemo(
    () => ({
      ...dailyTotals,
      logs: todayLogs,
    }),
    [dailyTotals, todayLogs]
  )

  // Track last added entry for undo functionality (in-memory only)
  // Using ref to persist across renders; value is cleared on component unmount
  const lastAddedEntryRef = useRef<LogEntry | null>(null)

  /**
   * Adds a food item to today's log and updates recent items.
   * Returns the created entry for undo/toast display.
   */
  const addFood = useCallback(
    (food: FoodItem, portion: PortionSize): LogEntry => {
      const newEntry = createLogEntry(food, portion)
      
      const { logs: updatedLogs, recentItems: updatedRecent } = addLogEntry(
        logs,
        recentItems,
        newEntry
      )
      
      setLogs(updatedLogs)
      setRecentItems(updatedRecent)
      // Store entry in ref to persist across renders
      lastAddedEntryRef.current = newEntry
      
      return newEntry
    },
    [logs, recentItems, setLogs, setRecentItems]
  )

  /**
   * Removes a specific log entry by ID.
   * Used for swipe-to-delete in meal list.
   */
  const removeLog = useCallback(
    (entryId: string) => {
      setLogs((prev) => removeLogEntry(prev, entryId))
    },
    [setLogs]
  )

  /**
   * Undoes the most recent log addition.
   * Returns the removed entry for toast display, or null if nothing to undo.
   */
  const undoLastLog = useCallback((): LogEntry | null => {
    if (!lastAddedEntryRef.current) return null
    
    const entryToRemove = lastAddedEntryRef.current
    setLogs((prev) => removeLogEntry(prev, entryToRemove.id))
    // Clear ref after undo
    lastAddedEntryRef.current = null
    
    return entryToRemove
  }, [setLogs])

  /**
   * Clears all logs from today (user-initiated reset).
   */
  const clearTodayLogs = useCallback(() => {
    setLogs((prev) => prev.filter((log) => !getTodayLogs([log]).length))
  }, [setLogs])

  /**
   * Removes logs older than specified days to prevent storage bloat.
   * Should be called periodically (e.g., on app mount).
   */
  const pruneOldData = useCallback(
    (daysToKeep: number = 30) => {
      setLogs((prev) => pruneOldLogs(prev, daysToKeep))
    },
    [setLogs]
  )

  return {
    logs,
    todayLogs,
    recentItems,
    goals,
    dailySummary,
    addFood,
    removeLog,
    undoLastLog,
    clearTodayLogs,
    pruneOldData,
  }
}
