/**
 * useSearch - Hook for food search functionality.
 * Handles debounced search, ranking, recent searches persistence, and combined results.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import {
  searchSystemFoods,
  searchCustomFoods,
  getCustomFoodsByUser,
  getAllSystemFoods,
} from '@/db/repositories/food-repository'
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
} from '@/db/repositories/search-repository'
import { getFavoritesByUser } from '@/db/repositories/favorite-repository'
import type { SystemFood, CustomFood, RecentSearch, Favorite } from '@/db/types'
import type { SearchResult } from '@/components/QuickAdd/SearchResults'
import { debounce } from '@/lib/utils'

// Debounce delay per FR-001.2
const SEARCH_DEBOUNCE_MS = 150

// Maximum results per FR-002.1
const MAX_RESULTS = 20

interface UseSearchReturn {
  // Search state
  query: string
  setQuery: (query: string) => void
  results: SearchResult[]
  isSearching: boolean
  hasSearched: boolean

  // Recent searches
  recentSearches: RecentSearch[]
  saveRecentSearch: (term: string) => Promise<void>
  deleteRecentSearchItem: (id: number) => Promise<void>
  clearAllRecentSearches: () => Promise<void>

  // All foods for grid display
  systemFoods: SystemFood[]
  customFoods: CustomFood[]

  // Refresh data
  refreshFoods: () => Promise<void>
  refreshRecentSearches: () => Promise<void>
}

/**
 * Hook for managing food search with debouncing, ranking, and recent searches.
 */
export function useSearch(): UseSearchReturn {
  const currentUser = useCurrentUser()

  // Search state
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Data state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [systemFoods, setSystemFoods] = useState<SystemFood[]>([])
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])

  // Track if initial load completed
  const initialLoadRef = useRef(false)

  /**
   * Load initial data on mount.
   */
  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    const loadInitialData = async () => {
      try {
        const [systemFoodsData, customFoodsData, recentSearchesData, favoritesData] =
          await Promise.all([
            getAllSystemFoods(),
            getCustomFoodsByUser(currentUser.id),
            getRecentSearches(currentUser.id),
            getFavoritesByUser(currentUser.id),
          ])

        setSystemFoods(systemFoodsData)
        setCustomFoods(customFoodsData)
        setRecentSearches(recentSearchesData)
        setFavorites(favoritesData)
      } catch (error) {
        console.error('Failed to load initial search data:', error)
      }
    }

    loadInitialData()
  }, [currentUser.id])

  /**
   * Check if a food is favorited.
   */
  const isFavorited = useCallback(
    (foodType: 'system' | 'custom', foodId: string): boolean => {
      return favorites.some(
        (fav) => fav.foodType === foodType && fav.foodId === foodId
      )
    },
    [favorites]
  )

  /**
   * Convert system food to search result.
   */
  const systemFoodToResult = useCallback(
    (food: SystemFood): SearchResult => ({
      id: food.id,
      name: food.nameVi,
      nameEn: food.nameEn,
      kcal: food.kcalM, // Display M portion as default
      protein: food.proteinM,
      foodType: 'system',
      isFavorited: isFavorited('system', food.id),
    }),
    [isFavorited]
  )

  /**
   * Convert custom food to search result.
   */
  const customFoodToResult = useCallback(
    (food: CustomFood): SearchResult => ({
      id: food.id,
      name: food.name,
      kcal: food.kcal,
      protein: food.protein ?? 0,
      foodType: 'custom',
      isFavorited: isFavorited('custom', food.id),
    }),
    [isFavorited]
  )

  /**
   * Perform search with ranking.
   * Ranking: exact prefix match first, then substring, then alphabetical.
   */
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsSearching(false)
        setHasSearched(false)
        return
      }

      setIsSearching(true)
      setHasSearched(true)

      try {
        // Search both system and custom foods
        const [systemResults, customResults] = await Promise.all([
          searchSystemFoods(searchQuery),
          searchCustomFoods(currentUser.id, searchQuery),
        ])

        // Convert to unified format
        const systemSearchResults = systemResults.map(systemFoodToResult)
        const customSearchResults = customResults.map(customFoodToResult)

        // Combine and rank results
        const combinedResults = [...systemSearchResults, ...customSearchResults]
        const rankedResults = rankSearchResults(combinedResults, searchQuery)

        // Limit results
        setResults(rankedResults.slice(0, MAX_RESULTS))
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [currentUser.id, systemFoodToResult, customFoodToResult]
  )

  /**
   * Debounced search function.
   */
  const debouncedSearch = useMemo(
    () => debounce(performSearch, SEARCH_DEBOUNCE_MS),
    [performSearch]
  )

  /**
   * Set query and trigger debounced search.
   */
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery)

      if (!newQuery.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }

      setIsSearching(true)
      debouncedSearch(newQuery)
    },
    [debouncedSearch]
  )

  /**
   * Save a search term to recent searches.
   */
  const saveRecentSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) return

      try {
        await addRecentSearch(currentUser.id, term)
        const updated = await getRecentSearches(currentUser.id)
        setRecentSearches(updated)
      } catch (error) {
        console.error('Failed to save recent search:', error)
      }
    },
    [currentUser.id]
  )

  /**
   * Delete a specific recent search.
   */
  const deleteRecentSearchItem = useCallback(
    async (id: number) => {
      try {
        await deleteRecentSearch(id)
        const updated = await getRecentSearches(currentUser.id)
        setRecentSearches(updated)
      } catch (error) {
        console.error('Failed to delete recent search:', error)
      }
    },
    [currentUser.id]
  )

  /**
   * Clear all recent searches.
   */
  const clearAllRecentSearches = useCallback(async () => {
    try {
      await clearRecentSearches(currentUser.id)
      setRecentSearches([])
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }, [currentUser.id])

  /**
   * Refresh foods data.
   */
  const refreshFoods = useCallback(async () => {
    try {
      const [systemFoodsData, customFoodsData, favoritesData] = await Promise.all([
        getAllSystemFoods(),
        getCustomFoodsByUser(currentUser.id),
        getFavoritesByUser(currentUser.id),
      ])

      setSystemFoods(systemFoodsData)
      setCustomFoods(customFoodsData)
      setFavorites(favoritesData)

      // Re-run search if there's an active query
      if (query.trim()) {
        performSearch(query)
      }
    } catch (error) {
      console.error('Failed to refresh foods:', error)
    }
  }, [currentUser.id, query, performSearch])

  /**
   * Refresh recent searches.
   */
  const refreshRecentSearches = useCallback(async () => {
    try {
      const updated = await getRecentSearches(currentUser.id)
      setRecentSearches(updated)
    } catch (error) {
      console.error('Failed to refresh recent searches:', error)
    }
  }, [currentUser.id])

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched,
    recentSearches,
    saveRecentSearch,
    deleteRecentSearchItem,
    clearAllRecentSearches,
    systemFoods,
    customFoods,
    refreshFoods,
    refreshRecentSearches,
  }
}

/**
 * Rank search results: exact prefix match first, then substring, then alphabetical.
 */
function rankSearchResults(
  results: SearchResult[],
  query: string
): SearchResult[] {
  const lowerQuery = query.toLowerCase()

  return results.sort((a, b) => {
    const aLower = a.name.toLowerCase()
    const bLower = b.name.toLowerCase()

    // Exact match first
    const aExact = aLower === lowerQuery
    const bExact = bLower === lowerQuery
    if (aExact && !bExact) return -1
    if (bExact && !aExact) return 1

    // Prefix match second
    const aPrefix = aLower.startsWith(lowerQuery)
    const bPrefix = bLower.startsWith(lowerQuery)
    if (aPrefix && !bPrefix) return -1
    if (bPrefix && !aPrefix) return 1

    // Alphabetical for remaining
    return aLower.localeCompare(bLower, 'vi')
  })
}
