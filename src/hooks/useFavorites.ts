/**
 * Hook for managing favorites with food details.
 * Fetches favorites from database, resolves food information,
 * and provides actions for logging favorites.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import {
  getFavoritesByFrequency,
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
 */
export function useFavorites(limit: number = 8): UseFavoritesReturn {
  const { isInitialised, currentUser } = useDatabaseContext()
  const [favorites, setFavorites] = useState<FavoriteWithFood[]>([])
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
      // Fetch favorites sorted by frequency
      const dbFavorites = await getFavoritesByFrequency(currentUser.id, limit)

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
    isLoading,
    error,
    refresh: loadFavorites,
  }
}
