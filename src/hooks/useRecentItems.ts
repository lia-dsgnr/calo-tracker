/**
 * useRecentItems - Hook for managing recent food logs with source information.
 * Loads recent logs and resolves to display items with source indicators.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import { getRecentLogs } from '@/db/repositories/log-repository'
import { getCustomFoodById } from '@/db/repositories/food-repository'
import { isFavorited } from '@/db/repositories/favorite-repository'
import type { FoodLog } from '@/db/types'
import type { RecentDisplayItem } from '@/components/QuickAdd/RecentSection'

// Maximum recent items to display
const MAX_RECENT_ITEMS = 20

interface UseRecentItemsReturn {
  recentItems: RecentDisplayItem[]
  isLoading: boolean
  refreshRecentItems: () => Promise<void>
}

/**
 * Hook for loading and managing recent food logs.
 */
export function useRecentItems(): UseRecentItemsReturn {
  const currentUser = useCurrentUser()

  const [recentItems, setRecentItems] = useState<RecentDisplayItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const initialLoadRef = useRef(false)

  /**
   * Load recent logs on mount.
   */
  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    loadRecentItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Load recent logs and resolve to display items.
   */
  const loadRecentItems = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get recent logs (last 7 days)
      const logs = await getRecentLogs(currentUser.id, 7)

      // Resolve to display items with source info
      const displayItems = await resolveLogsToDisplayItems(logs, currentUser.id)

      // Limit and set
      setRecentItems(displayItems.slice(0, MAX_RECENT_ITEMS))
    } catch (error) {
      console.error('Failed to load recent items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser.id])

  /**
   * Refresh recent items.
   */
  const refreshRecentItems = useCallback(async () => {
    await loadRecentItems()
  }, [loadRecentItems])

  return {
    recentItems,
    isLoading,
    refreshRecentItems,
  }
}

/**
 * Resolve food logs to display items with source information.
 */
async function resolveLogsToDisplayItems(
  logs: FoodLog[],
  userId: string
): Promise<RecentDisplayItem[]> {
  const displayItems: RecentDisplayItem[] = []

  for (const log of logs) {
    let isDeleted = false
    let favorited = false

    // Check if custom food was deleted
    if (log.foodType === 'custom') {
      const customFood = await getCustomFoodById(log.foodId)
      isDeleted = customFood === null
    }

    // Check favorite status (only for non-deleted items)
    if (!isDeleted) {
      favorited = await isFavorited(userId, log.foodType, log.foodId)
    }

    displayItems.push({
      id: log.id,
      foodId: log.foodId,
      foodType: log.foodType,
      name: log.nameSnapshot,
      kcal: log.kcal,
      protein: log.protein,
      portion: log.portion === 'single' ? '' : log.portion,
      loggedAt: log.loggedAt,
      isDeleted,
      isFavorited: favorited,
    })
  }

  return displayItems
}
