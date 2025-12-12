/**
 * localStorage key constants and domain-specific helpers for Calo Tracker.
 * Centralizes storage logic to ensure consistent data access patterns.
 */

import type { DailyGoals, LogEntry, RecentItem, PortionSize, FoodItem } from '../types'
import { generateId, isToday } from './utils'

// localStorage keys - prefixed to avoid collisions with other apps
export const STORAGE_KEYS = {
  LOGS: 'calo_logs',
  RECENT: 'calo_recent',
  GOALS: 'calo_goals',
} as const

// MVP default goals - read-only for this version
// Based on 1800 kcal: ~45% carbs, ~25% protein, ~30% fat
export const DEFAULT_GOALS: DailyGoals = {
  dailyKcal: 1800,
  dailyProtein: 75,
  dailyCarbs: 200,
  dailyFat: 60,
}

// Maximum recent items to track (per spec: last 8 unique foods)
export const MAX_RECENT_ITEMS = 8

/**
 * Creates a new log entry from a food item selection.
 * Denormalizes name_vi for display without requiring food lookup.
 */
export function createLogEntry(
  food: FoodItem,
  portion: PortionSize
): LogEntry {
  const nutrition = food.portions[portion]
  return {
    id: generateId(),
    foodId: food.id,
    name_vi: food.name_vi,
    portion,
    kcal: nutrition.kcal,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    timestamp: Date.now(),
  }
}

/**
 * Adds a log entry and updates recent items list.
 * Returns updated logs and recent items arrays.
 */
export function addLogEntry(
  logs: LogEntry[],
  recentItems: RecentItem[],
  newEntry: LogEntry
): { logs: LogEntry[]; recentItems: RecentItem[] } {
  // Append new log entry
  const updatedLogs = [...logs, newEntry]

  // Update recent items: move this food to front, dedupe, trim to max
  const updatedRecent = updateRecentItems(recentItems, {
    foodId: newEntry.foodId,
    name_vi: newEntry.name_vi,
    lastLogged: newEntry.timestamp,
  })

  return { logs: updatedLogs, recentItems: updatedRecent }
}

/**
 * Removes a log entry by ID (for undo/delete functionality).
 */
export function removeLogEntry(
  logs: LogEntry[],
  entryId: string
): LogEntry[] {
  return logs.filter((log) => log.id !== entryId)
}

/**
 * Updates recent items list: adds/moves item to front, dedupes by foodId, trims to max.
 * Sorted by most recently logged.
 */
export function updateRecentItems(
  recentItems: RecentItem[],
  newItem: RecentItem
): RecentItem[] {
  // Remove existing entry for same food (if any)
  const filtered = recentItems.filter((item) => item.foodId !== newItem.foodId)
  
  // Add new item at front (most recent first)
  const updated = [newItem, ...filtered]
  
  // Trim to max allowed items
  return updated.slice(0, MAX_RECENT_ITEMS)
}

/**
 * Filters logs to only include entries from today (local midnight reset).
 * Critical for daily tracking reset logic.
 */
export function getTodayLogs(logs: LogEntry[]): LogEntry[] {
  return logs.filter((log) => isToday(log.timestamp))
}

/**
 * Calculates daily totals from today's log entries.
 * Used by Dashboard to show progress toward goals.
 */
export function calculateDailyTotals(
  logs: LogEntry[],
  goals: DailyGoals
): {
  consumedKcal: number
  consumedProtein: number
  consumedCarbs: number
  consumedFat: number
  remainingKcal: number
  remainingProtein: number
} {
  const todayLogs = getTodayLogs(logs)
  
  const consumedKcal = todayLogs.reduce((sum, log) => sum + log.kcal, 0)
  const consumedProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0)
  const consumedCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs ?? 0), 0)
  const consumedFat = todayLogs.reduce((sum, log) => sum + (log.fat ?? 0), 0)

  return {
    consumedKcal,
    consumedProtein,
    consumedCarbs,
    consumedFat,
    // Can be negative when goal exceeded - UI handles display
    remainingKcal: goals.dailyKcal - consumedKcal,
    remainingProtein: goals.dailyProtein - consumedProtein,
  }
}

/**
 * Cleans up old log entries to prevent localStorage bloat.
 * Keeps only logs from the past N days.
 */
export function pruneOldLogs(
  logs: LogEntry[],
  daysToKeep: number = 30
): LogEntry[] {
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
  return logs.filter((log) => log.timestamp >= cutoffTime)
}

/**
 * Safely reads and parses data from localStorage.
 * Returns null if key doesn't exist or data is corrupted.
 */
export function readFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : null
  } catch {
    return null
  }
}

/**
 * Safely writes data to localStorage.
 * Fails silently on quota exceeded or private browsing mode.
 */
export function writeToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Clears all Calo Tracker data from localStorage.
 * Useful for debugging or user-initiated reset.
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key)
  })
}

/**
 * Migrates existing log entries to include carbs/fat values.
 * Looks up food data to backfill missing macro fields.
 * Should be called on app init to handle legacy data.
 */
export function migrateLogs(
  logs: LogEntry[],
  foods: FoodItem[]
): LogEntry[] {
  const foodMap = new Map(foods.map((f) => [f.id, f]))

  return logs.map((log) => {
    // Skip if already has carbs/fat data
    if (log.carbs !== undefined && log.fat !== undefined) {
      return log
    }

    // Look up food to backfill macro data
    const food = foodMap.get(log.foodId)
    if (!food) {
      // Food not found - default to 0
      return { ...log, carbs: 0, fat: 0 }
    }

    const nutrition = food.portions[log.portion]
    return {
      ...log,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    }
  })
}
