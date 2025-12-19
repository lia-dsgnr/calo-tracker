/**
 * useFoodSearch - Hook for searching foods across multiple sources.
 * Queries favourites, recently logged foods, and all system foods in parallel.
 * Returns grouped results with deduplication and log counts.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDatabaseContext } from '@/contexts/useDatabaseContext'
import {
  getFavoritesByUser,
  getRecentLogs,
  getAllSystemFoods,
  getSystemFoodById,
  toggleFavorite,
} from '@/db'
import { trackEvent } from '@/lib/analytics'
import type { FoodItem, FoodCategory } from '@/types'
import type { SystemFood, Favorite, FoodLog } from '@/db/types'

// Debounce delay for search queries
const SEARCH_DEBOUNCE_MS = 200

/**
 * Search result item with source metadata.
 * Includes whether the food is currently in the user's favourites list.
 */
export interface SearchResultItem {
  food: FoodItem
  /** Source of this result: favourite, recent, or database */
  source: 'favourite' | 'recent' | 'database'
  /** Whether this food is in the user's favourites */
  isFavorite: boolean
  /** Number of times logged (for recent items) */
  logCount?: number
  /** Days since last logged (for recent items) */
  daysSinceLogged?: number
}

/**
 * Grouped search results for display.
 */
export interface SearchResults {
  favourites: SearchResultItem[]
  recentlyLogged: SearchResultItem[]
  allFoods: SearchResultItem[]
  /** Whether any results were found */
  hasResults: boolean
  /** Whether user has any logging history */
  hasHistory: boolean
}

interface UseFoodSearchReturn {
  /** Current search query */
  query: string
  /** Set the search query */
  setQuery: (query: string) => void
  /** Grouped search results */
  results: SearchResults
  /** Whether search is in progress */
  isSearching: boolean
  /** Clear the search query */
  clearQuery: () => void
  /** Toggle favourite status for a given food, updating search results */
  toggleFavoriteForFood: (food: FoodItem) => Promise<void>
}

/**
 * Convert SystemFood (DB) to FoodItem (UI).
 */
function toFoodItem(sf: SystemFood): FoodItem {
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
 * Check if a food name matches the search query.
 */
function matchesQuery(food: FoodItem, query: string): boolean {
  const lowerQuery = query.toLowerCase()
  return (
    food.name_vi.toLowerCase().includes(lowerQuery) ||
    food.name_en.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Hook for searching foods with debouncing and grouped results.
 */
export function useFoodSearch(): UseFoodSearchReturn {
  const { currentUser, isInitialised } = useDatabaseContext()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Raw data from database
  const [favourites, setFavourites] = useState<Favorite[]>([])
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([])
  const [allFoods, setAllFoods] = useState<SystemFood[]>([])
  const [favouriteFoods, setFavouriteFoods] = useState<Map<string, FoodItem>>(
    new Map()
  )

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  /**
   * Helper: load favourites from database and resolve their food details.
   * Keeps favourite state in sync when user adds/removes favourites from search.
   */
  const refreshFavourites = useCallback(async () => {
    if (!isInitialised || !currentUser) return

    const favs = await getFavoritesByUser(currentUser.id)
    setFavourites(favs)

    const favFoodsMap = new Map<string, FoodItem>()
    await Promise.all(
      favs.map(async (fav) => {
        if (fav.foodType === 'system') {
          const food = await getSystemFoodById(fav.foodId)
          if (food) {
            favFoodsMap.set(fav.foodId, toFoodItem(food))
          }
        }
      })
    )
    setFavouriteFoods(favFoodsMap)
  }, [currentUser, isInitialised])

  // Load initial data (favourites, recent logs, and system foods) on mount
  useEffect(() => {
    if (!isInitialised || !currentUser) return

    const loadInitialData = async () => {
      try {
        await refreshFavourites()

        const [logs, foods] = await Promise.all([
          getRecentLogs(currentUser.id, 7),
          getAllSystemFoods(),
        ])

        setRecentLogs(logs)
        setAllFoods(foods)
      } catch (err) {
        console.error('Error loading search data:', err)
      }
    }

    loadInitialData()
  }, [isInitialised, currentUser, refreshFavourites])

  // Compute search results based on debounced query
  const results = useMemo((): SearchResults => {
    setIsSearching(true)

    const hasHistory = recentLogs.length > 0

    // If no query, show all foods A-Z (first-time / empty state)
    if (!debouncedQuery.trim()) {
      setIsSearching(false)

      // Show favourites and recent even without query
      const favouriteResults: SearchResultItem[] = []
      const favouriteIds = new Set(favourites.map((f) => f.foodId))

      favourites.forEach((fav) => {
        const food = favouriteFoods.get(fav.foodId)
        if (food) {
          favouriteResults.push({
            food,
            source: 'favourite',
            isFavorite: true,
          })
        }
      })

      // Build recently logged with log counts
      const recentFoodCounts = new Map<string, { count: number; lastDate: number }>()
      recentLogs.forEach((log) => {
        const existing = recentFoodCounts.get(log.foodId)
        if (existing) {
          existing.count++
          existing.lastDate = Math.max(existing.lastDate, log.loggedAt)
        } else {
          recentFoodCounts.set(log.foodId, { count: 1, lastDate: log.loggedAt })
        }
      })

      const recentResults: SearchResultItem[] = []
      const seenRecent = new Set<string>()

      for (const [foodId, { count, lastDate }] of recentFoodCounts) {
        if (seenRecent.has(foodId) || favouriteIds.has(foodId)) continue
        seenRecent.add(foodId)

        const systemFood = allFoods.find((f) => f.id === foodId)
        if (systemFood) {
          const daysSince = Math.floor(
            (Date.now() - lastDate) / (1000 * 60 * 60 * 24)
          )
          recentResults.push({
            food: toFoodItem(systemFood),
            source: 'recent',
            isFavorite: favouriteIds.has(foodId),
            logCount: count,
            daysSinceLogged: daysSince,
          })
        }
      }

      // Sort recent by count descending
      recentResults.sort((a, b) => (b.logCount ?? 0) - (a.logCount ?? 0))

      // All foods A-Z (excluding favourites and recent)
      const excludeIds = new Set([
        ...favouriteIds,
        ...Array.from(seenRecent),
      ])
      const allFoodsResults: SearchResultItem[] = allFoods
        .filter((f) => !excludeIds.has(f.id))
        .map((f) => ({
          food: toFoodItem(f),
          source: 'database' as const,
          isFavorite: favouriteIds.has(f.id),
        }))

      return {
        favourites: favouriteResults,
        recentlyLogged: recentResults.slice(0, 10),
        allFoods: allFoodsResults,
        hasResults: true,
        hasHistory,
      }
    }

    // Search with query: filter each group
    const lowerQuery = debouncedQuery.toLowerCase()

    // Filter favourites
    const favouriteResults: SearchResultItem[] = []
    const favouriteIds = new Set(favourites.map((f) => f.foodId))

    favourites.forEach((fav) => {
      const food = favouriteFoods.get(fav.foodId)
      if (food && matchesQuery(food, lowerQuery)) {
        favouriteResults.push({
          food,
          source: 'favourite',
          isFavorite: true,
        })
      }
    })

    // Build recently logged with log counts and filter
    const recentFoodCounts = new Map<string, { count: number; lastDate: number }>()
    recentLogs.forEach((log) => {
      const existing = recentFoodCounts.get(log.foodId)
      if (existing) {
        existing.count++
        existing.lastDate = Math.max(existing.lastDate, log.loggedAt)
      } else {
        recentFoodCounts.set(log.foodId, { count: 1, lastDate: log.loggedAt })
      }
    })

    const recentResults: SearchResultItem[] = []
    const seenRecent = new Set<string>()

    for (const [foodId, { count, lastDate }] of recentFoodCounts) {
      if (seenRecent.has(foodId) || favouriteIds.has(foodId)) continue

      const systemFood = allFoods.find((f) => f.id === foodId)
      if (systemFood) {
        const food = toFoodItem(systemFood)
        if (matchesQuery(food, lowerQuery)) {
          seenRecent.add(foodId)
          const daysSince = Math.floor(
            (Date.now() - lastDate) / (1000 * 60 * 60 * 24)
          )
          recentResults.push({
            food,
            source: 'recent',
            isFavorite: favouriteIds.has(foodId),
            logCount: count,
            daysSinceLogged: daysSince,
          })
        }
      }
    }

    // Sort recent by count descending
    recentResults.sort((a, b) => (b.logCount ?? 0) - (a.logCount ?? 0))

    // Filter all foods (excluding favourites and recent)
    const excludeIds = new Set([
      ...favouriteIds,
      ...Array.from(seenRecent),
    ])
    const allFoodsResults: SearchResultItem[] = allFoods
      .filter(
        (f) =>
          !excludeIds.has(f.id) &&
          (f.nameVi.toLowerCase().includes(lowerQuery) ||
            f.nameEn.toLowerCase().includes(lowerQuery))
      )
      .map((f) => ({
        food: toFoodItem(f),
        source: 'database' as const,
        isFavorite: favouriteIds.has(f.id),
      }))

    setIsSearching(false)

    const hasResults =
      favouriteResults.length > 0 ||
      recentResults.length > 0 ||
      allFoodsResults.length > 0

    return {
      favourites: favouriteResults,
      recentlyLogged: recentResults,
      allFoods: allFoodsResults,
      hasResults,
      hasHistory,
    }
  }, [debouncedQuery, favourites, favouriteFoods, recentLogs, allFoods])

  // Clear query handler
  const clearQuery = useCallback(() => {
    setQuery('')
  }, [])

  /**
   * Toggle favourite status for a given food.
   * Also tracks analytics and refreshes favourites so heart icons stay in sync.
   */
  const toggleFavoriteForFood = useCallback(
    async (food: FoodItem) => {
      if (!currentUser) return

      const result = await toggleFavorite(currentUser.id, 'system', food.id)

      if (result) {
        // Favourite was added from search
        trackEvent('favorite_added', {
          food_id: food.id,
          food_type: 'system',
          source: 'search',
        })
      } else {
        // Favourite was removed from search
        trackEvent('favorite_removed', {
          food_id: food.id,
          food_type: 'system',
        })
      }

      await refreshFavourites()
    },
    [currentUser, refreshFavourites]
  )

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearQuery,
    toggleFavoriteForFood,
  }
}
