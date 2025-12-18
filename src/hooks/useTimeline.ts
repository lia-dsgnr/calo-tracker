/**
 * Hook for managing meal timeline with tab-based navigation.
 * Fetches logs from database, groups into tabs (Today, Yesterday, weekdays, Older).
 * Provides tab selection state and filtered logs for the active tab.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import { getRecentLogs } from '../db/repositories/log-repository'
import type { FoodLog } from '../db/types'
import type { LogEntry, PortionSize } from '../types'
import {
  format,
  isToday,
  isYesterday,
  isBefore,
  startOfDay,
  subDays,
} from 'date-fns'

// Tab structure for timeline navigation
export interface TimelineTab {
  key: string // Unique identifier: 'today' | 'yesterday' | 'tue' | 'older' etc.
  label: string // Display label for the tab button
  date?: string // YYYY-MM-DD for specific days (undefined for 'older')
}

interface UseTimelineReturn {
  tabs: TimelineTab[]
  selectedTab: string
  setSelectedTab: (key: string) => void
  logs: LogEntry[] // Filtered logs for selected tab
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Map FoodLog (DB) to LogEntry (UI)
function toLogEntry(log: FoodLog): LogEntry {
  return {
    id: log.id,
    foodId: log.foodId,
    name_vi: log.nameSnapshot,
    portion: log.portion as PortionSize,
    kcal: log.kcal,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    timestamp: log.loggedAt,
  }
}

/**
 * Generate tab label based on date.
 * Today/Yesterday get semantic labels; other days show abbreviated weekday.
 */
function getTabLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE') // e.g., "Tue", "Mon"
}

/**
 * Generate tab key based on date.
 * Uses semantic keys for Today/Yesterday, lowercase weekday for others.
 */
function getTabKey(date: Date): string {
  if (isToday(date)) return 'today'
  if (isYesterday(date)) return 'yesterday'
  return format(date, 'EEE').toLowerCase() // e.g., "tue", "mon"
}

/**
 * Hook for fetching and managing meal timeline with tab navigation.
 * Generates tabs for the last 7 days plus an "Older" tab.
 */
export function useTimeline(days: number = 7): UseTimelineReturn {
  const { isInitialised, currentUser } = useDatabaseContext()
  const [allLogs, setAllLogs] = useState<LogEntry[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('today')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTimeline = useCallback(async () => {
    if (!isInitialised || !currentUser) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch logs for extended period (include older logs)
      const dbLogs = await getRecentLogs(currentUser.id, days + 7)
      const logs = dbLogs.map(toLogEntry)
      setAllLogs(logs)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load timeline'
      setError(errorMessage)
      console.error('Error loading timeline:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialised, currentUser, days])

  useEffect(() => {
    loadTimeline()
  }, [loadTimeline])

  // Generate tabs based on last 7 days + Older
  const tabs = useMemo<TimelineTab[]>(() => {
    const result: TimelineTab[] = []
    const today = startOfDay(new Date())

    // Generate tabs for each day in the range (Today through 6 days ago)
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i)
      const dateString = format(date, 'yyyy-MM-dd')

      result.push({
        key: getTabKey(date),
        label: getTabLabel(date),
        date: dateString,
      })
    }

    // Add "Older" tab for logs before the 7-day window
    result.push({
      key: 'older',
      label: 'Older',
      date: undefined,
    })

    return result
  }, [days])

  // Filter logs based on selected tab
  const logs = useMemo<LogEntry[]>(() => {
    const selectedTabData = tabs.find((tab) => tab.key === selectedTab)
    if (!selectedTabData) return []

    // For "Older" tab, show logs before the 7-day window
    if (selectedTab === 'older') {
      const cutoffDate = subDays(startOfDay(new Date()), days)

      return allLogs
        .filter((log) => {
          const logDate = new Date(log.timestamp)
          return isBefore(logDate, cutoffDate)
        })
        .sort((a, b) => b.timestamp - a.timestamp)
    }

    // For specific date tabs, filter by date string
    if (selectedTabData.date) {
      return allLogs
        .filter((log) => {
          const logDateString = format(new Date(log.timestamp), 'yyyy-MM-dd')
          return logDateString === selectedTabData.date
        })
        .sort((a, b) => b.timestamp - a.timestamp)
    }

    return []
  }, [allLogs, selectedTab, tabs, days])

  return {
    tabs,
    selectedTab,
    setSelectedTab,
    logs,
    isLoading,
    error,
    refresh: loadTimeline,
  }
}
