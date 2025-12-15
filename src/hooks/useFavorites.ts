/**
 * useFavorites - Hook for managing user's favorite foods.
 * Handles favorites list, toggle, limit checks, and warning thresholds.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import {
  getFavoritesByUser,
  getFavoriteCount,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  isFavorited,
} from '@/db/repositories/favorite-repository'
import {
  getSystemFoodById,
  getCustomFoodById,
} from '@/db/repositories/food-repository'
import type { Favorite, FoodType } from '@/db/types'
import { DB_LIMITS } from '@/db/types'
import type { FavoriteDisplayItem } from '@/components/QuickAdd/FavoritesTab'

// Warning threshold: show toast when this many slots remain
const WARNING_THRESHOLD = 2

interface UseFavoritesReturn {
  // Favorites data
  favorites: FavoriteDisplayItem[]
  favoriteCount: number
  maxFavorites: number
  isLoading: boolean

  // Actions
  addToFavorites: (foodType: FoodType, foodId: string) => Promise<AddFavoriteResult>
  removeFromFavorites: (foodType: FoodType, foodId: string) => Promise<void>
  toggleFavoriteStatus: (foodType: FoodType, foodId: string) => Promise<ToggleFavoriteResult>
  checkIsFavorited: (foodType: FoodType, foodId: string) => Promise<boolean>

  // Refresh
  refreshFavorites: () => Promise<void>
}

interface AddFavoriteResult {
  success: boolean
  isAtLimit: boolean
  slotsRemaining: number
  showWarning: boolean
}

interface ToggleFavoriteResult {
  isFavorited: boolean
  isAtLimit: boolean
  slotsRemaining: number
  showWarning: boolean
}

/**
 * Hook for managing favorites with limit checks and warnings.
 */
export function useFavorites(): UseFavoritesReturn {
  const currentUser = useCurrentUser()

  const [favorites, setFavorites] = useState<FavoriteDisplayItem[]>([])
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const initialLoadRef = useRef(false)

  /**
   * Load favorites on mount.
   */
  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Load favorites and resolve to display items.
   */
  const loadFavorites = useCallback(async () => {
    setIsLoading(true)
    try {
      const [favoritesData, count] = await Promise.all([
        getFavoritesByUser(currentUser.id),
        getFavoriteCount(currentUser.id),
      ])

      // Resolve favorites to display items
      const displayItems = await resolveFavoritesToDisplayItems(favoritesData)

      setFavorites(displayItems)
      setFavoriteCount(count)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser.id])

  /**
   * Add a food to favorites.
   */
  const addToFavorites = useCallback(
    async (foodType: FoodType, foodId: string): Promise<AddFavoriteResult> => {
      const count = await getFavoriteCount(currentUser.id)
      const slotsRemaining = DB_LIMITS.MAX_FAVORITES_PER_USER - count

      // Check if at limit
      if (count >= DB_LIMITS.MAX_FAVORITES_PER_USER) {
        return {
          success: false,
          isAtLimit: true,
          slotsRemaining: 0,
          showWarning: false,
        }
      }

      // Add to favorites
      const favorite = await addFavorite(currentUser.id, foodType, foodId)

      if (!favorite) {
        return {
          success: false,
          isAtLimit: true,
          slotsRemaining: 0,
          showWarning: false,
        }
      }

      // Refresh list
      await loadFavorites()

      // Calculate slots remaining after addition
      const newSlotsRemaining = slotsRemaining - 1

      return {
        success: true,
        isAtLimit: false,
        slotsRemaining: newSlotsRemaining,
        showWarning: newSlotsRemaining <= WARNING_THRESHOLD && newSlotsRemaining > 0,
      }
    },
    [currentUser.id, loadFavorites]
  )

  /**
   * Remove a food from favorites.
   */
  const removeFromFavorites = useCallback(
    async (foodType: FoodType, foodId: string): Promise<void> => {
      await removeFavorite(currentUser.id, foodType, foodId)
      await loadFavorites()
    },
    [currentUser.id, loadFavorites]
  )

  /**
   * Toggle favorite status.
   */
  const toggleFavoriteStatus = useCallback(
    async (foodType: FoodType, foodId: string): Promise<ToggleFavoriteResult> => {
      // Check current status
      const currentlyFavorited = await isFavorited(currentUser.id, foodType, foodId)

      if (currentlyFavorited) {
        // Remove from favorites
        await removeFavorite(currentUser.id, foodType, foodId)
        await loadFavorites()

        const count = await getFavoriteCount(currentUser.id)
        return {
          isFavorited: false,
          isAtLimit: false,
          slotsRemaining: DB_LIMITS.MAX_FAVORITES_PER_USER - count,
          showWarning: false,
        }
      }

      // Adding to favorites - check limit
      const count = await getFavoriteCount(currentUser.id)
      const slotsRemaining = DB_LIMITS.MAX_FAVORITES_PER_USER - count

      if (count >= DB_LIMITS.MAX_FAVORITES_PER_USER) {
        return {
          isFavorited: false,
          isAtLimit: true,
          slotsRemaining: 0,
          showWarning: false,
        }
      }

      // Add to favorites
      await toggleFavorite(currentUser.id, foodType, foodId)
      await loadFavorites()

      const newSlotsRemaining = slotsRemaining - 1

      return {
        isFavorited: true,
        isAtLimit: false,
        slotsRemaining: newSlotsRemaining,
        showWarning: newSlotsRemaining <= WARNING_THRESHOLD && newSlotsRemaining > 0,
      }
    },
    [currentUser.id, loadFavorites]
  )

  /**
   * Check if a food is favorited.
   */
  const checkIsFavorited = useCallback(
    async (foodType: FoodType, foodId: string): Promise<boolean> => {
      return isFavorited(currentUser.id, foodType, foodId)
    },
    [currentUser.id]
  )

  /**
   * Refresh favorites.
   */
  const refreshFavorites = useCallback(async () => {
    await loadFavorites()
  }, [loadFavorites])

  return {
    favorites,
    favoriteCount,
    maxFavorites: DB_LIMITS.MAX_FAVORITES_PER_USER,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavoriteStatus,
    checkIsFavorited,
    refreshFavorites,
  }
}

/**
 * Resolve favorite entries to display items with food details.
 */
async function resolveFavoritesToDisplayItems(
  favorites: Favorite[]
): Promise<FavoriteDisplayItem[]> {
  const displayItems: FavoriteDisplayItem[] = []

  for (const fav of favorites) {
    try {
      if (fav.foodType === 'system') {
        const food = await getSystemFoodById(fav.foodId)
        if (food) {
          displayItems.push({
            id: fav.id,
            foodId: food.id,
            foodType: 'system',
            name: food.nameVi,
            nameEn: food.nameEn,
            kcal: food.kcalM, // Use M portion as default
            protein: food.proteinM,
          })
        }
      } else {
        const food = await getCustomFoodById(fav.foodId)
        if (food) {
          displayItems.push({
            id: fav.id,
            foodId: food.id,
            foodType: 'custom',
            name: food.name,
            kcal: food.kcal,
            protein: food.protein ?? 0,
          })
        }
      }
    } catch (error) {
      console.error(`Failed to resolve favorite ${fav.id}:`, error)
    }
  }

  return displayItems
}
