/**
 * Hook for managing favorites with food details.
 * Fetches favorites from database, resolves food information,
 * and provides actions for logging favorites.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import {
  getFavoritesByFrequency,
  getFavoriteCount,
} from '../db/repositories/favorite-repository'
import { getSystemFoodById } from '../db/repositories/food-repository'
import type { Favorite } from '../db/types'
import type { FoodItem, FoodCategory } from '../types'

interface FavoriteWithFood {
  favorite: Favorite
  food: FoodItem | null
}

interface UseFavoritesReturn {
  favorites: FavoriteWithFood[]
  totalCount: number
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Convert SystemFood (DB) to FoodItem (UI)
function toFoodItem(sf: {
  id: string
  nameVi: string
  nameEn: string
  category: string
  servingDescription: string | null
  confidence: number
  kcalS: number
  proteinS: number
  fatS: number
  carbsS: number
  kcalM: number
  proteinM: number
  fatM: number
  carbsM: number
  kcalL: number
  proteinL: number
  fatL: number
  carbsL: number
}): FoodItem {
  return {
    id: sf.id,
    name_vi: sf.nameVi,
    name_en: sf.nameEn,
    category: sf.category as FoodCategory,
    serving: sf.servingDescription ?? '',
    confidence: sf.confidence,
    portions: {
      S: { kcal: sf.kcalS, protein: sf.proteinS, fat: sf.fatS, carbs: sf.carbsS },
      M: { kcal: sf.kcalM, protein: sf.proteinM, fat: sf.fatM, carbs: sf.carbsM },
      L: { kcal: sf.kcalL, protein: sf.proteinL, fat: sf.fatL, carbs: sf.carbsL },
    },
  }
}

/**
 * Hook for fetching and managing user favorites.
 * Resolves food details for each favorite and provides refresh capability.
 * Fetches all favorites (up to 100) to support expand/collapse functionality.
 */
export function useFavorites(limit: number | null = null): UseFavoritesReturn {
  const { isInitialised, currentUser } = useDatabaseContext()
  const [favorites, setFavorites] = useState<FavoriteWithFood[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFavorites = useCallback(async () => {
    if (!isInitialised || !currentUser) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch total count for display in title
      const count = await getFavoriteCount(currentUser.id)
      setTotalCount(count)

      // Fetch all favorites (use high limit to get all, since max is 20 per user)
      // If limit is provided, use it; otherwise fetch all (max 100 is more than enough)
      const fetchLimit = limit ?? 100
      const dbFavorites = await getFavoritesByFrequency(currentUser.id, fetchLimit)

      // Resolve food details for each favorite
      const favoritesWithFood = await Promise.all(
        dbFavorites.map(async (favorite) => {
          let food: FoodItem | null = null

          // Only resolve system foods for now (custom foods require different handling)
          if (favorite.foodType === 'system') {
            const systemFood = await getSystemFoodById(favorite.foodId)
            if (systemFood) {
              food = toFoodItem(systemFood)
            }
          }

          return { favorite, food }
        })
      )

      setFavorites(favoritesWithFood)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load favorites'
      setError(errorMessage)
      console.error('Error loading favorites:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialised, currentUser, limit])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return {
    favorites,
    totalCount,
    isLoading,
    error,
    refresh: loadFavorites,
  }
}
