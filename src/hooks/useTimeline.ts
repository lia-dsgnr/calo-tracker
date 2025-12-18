/**
 * Hook for managing meal timeline (recent logs).
 * Fetches logs from database, groups by date, and provides actions.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import { getRecentLogs } from '../db/repositories/log-repository'
import type { FoodLog } from '../db/types'
import type { LogEntry, PortionSize } from '../types'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale/vi'

interface TimelineGroup {
  date: string
  dateLabel: string
  logs: LogEntry[]
}

interface UseTimelineReturn {
  groups: TimelineGroup[]
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

// Format date label for timeline groups
function formatDateLabel(dateString: string): string {
  const date = parseISO(dateString)

  if (isToday(date)) {
    return 'Today'
  }
  if (isYesterday(date)) {
    return 'Yesterday'
  }

  // Format as "Mon 16 Dec" in Vietnamese locale
  return format(date, 'EEE d MMM', { locale: vi })
}

/**
 * Hook for fetching and managing meal timeline.
 * Groups logs by date and provides refresh capability.
 */
export function useTimeline(days: number = 7): UseTimelineReturn {
  const { isInitialised, currentUser } = useDatabaseContext()
  const [groups, setGroups] = useState<TimelineGroup[]>([])
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
      // Fetch recent logs
      const dbLogs = await getRecentLogs(currentUser.id, days)
      const logs = dbLogs.map(toLogEntry)

      // Group logs by date
      const grouped = new Map<string, LogEntry[]>()

      for (const log of logs) {
        // Extract date from timestamp (YYYY-MM-DD format)
        const logDate = new Date(log.timestamp)
        const dateKey = format(logDate, 'yyyy-MM-dd')

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, [])
        }
        grouped.get(dateKey)!.push(log)
      }

      // Convert to timeline groups with labels
      const timelineGroups: TimelineGroup[] = Array.from(grouped.entries())
        .map(([date, dateLogs]) => ({
          date,
          dateLabel: formatDateLabel(date),
          logs: dateLogs.sort((a, b) => b.timestamp - a.timestamp), // Most recent first
        }))
        .sort((a, b) => b.date.localeCompare(a.date)) // Most recent date first

      setGroups(timelineGroups)
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

  return {
    groups,
    isLoading,
    error,
    refresh: loadTimeline,
  }
}
