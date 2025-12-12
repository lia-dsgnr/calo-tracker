/**
 * App - Root component for Calo Tracker.
 * Combines Dashboard (progress + meal history) with QuickAdd (food logging).
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { FoodTileGrid, PortionPicker, SearchInput, SearchResults } from '@/components/QuickAdd'
import { Toast } from '@/components/common'
import { useDatabaseStorage } from '@/hooks'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
} from '@/db'
import type { RecentSearch } from '@/db/types'
import { searchFoods, SEARCH_CONSTANTS } from '@/lib/search'
import type { FoodItem, PortionSize, ToastState, LogEntry } from '@/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

function App() {
  const { dailySummary, goals, recentItems, allFoods, addFood, removeLog } = useDatabaseStorage()
  const currentUser = useCurrentUser()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Portion picker state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [processingFoodId, setProcessingFoodId] = useState<string | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Refs for debouncing and undo
  const lastTapTimeRef = useRef<number>(0)
  const lastEntryRef = useRef<LogEntry | null>(null)

  // Load recent searches on mount
  useEffect(() => {
    async function loadRecentSearches() {
      const searches = await getRecentSearches(currentUser.id)
      setRecentSearches(searches)
    }
    loadRecentSearches()
  }, [currentUser.id])

  // Compute search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      return []
    }
    return searchFoods(allFoods, searchQuery)
  }, [allFoods, searchQuery])

  // Search handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setIsSearching(query.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH)
    if (query.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      setTimeout(() => setIsSearching(false), 100)
    }
  }, [])

  const handleSearchSubmit = useCallback(async () => {
    const trimmed = searchQuery.trim()
    if (trimmed.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      await addRecentSearch(currentUser.id, trimmed)
      const searches = await getRecentSearches(currentUser.id)
      setRecentSearches(searches)
    }
  }, [searchQuery, currentUser.id])

  const handleSearchFocus = useCallback(() => {}, [])
  const handleSearchBlur = useCallback(() => {}, [])
  const handleSearchClear = useCallback(() => {
    setSearchQuery('')
    setIsSearching(false)
  }, [])

  const handleSelectRecentSearch = useCallback((term: string) => setSearchQuery(term), [])
  const handleDeleteRecentSearch = useCallback(async (id: number) => {
    await deleteRecentSearch(id)
    const searches = await getRecentSearches(currentUser.id)
    setRecentSearches(searches)
  }, [currentUser.id])
  const handleClearRecentSearches = useCallback(async () => {
    await clearRecentSearches(currentUser.id)
    setRecentSearches([])
  }, [currentUser.id])

  const handleSelectFood = useCallback((food: FoodItem) => {
    const now = Date.now()
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) return
    lastTapTimeRef.current = now

    setSelectedFood(food)
    setProcessingFoodId(food.id)
  }, [])

  const handleSelectPortion = useCallback(
    async (portion: PortionSize) => {
      if (!selectedFood) return

      const entry = await addFood(selectedFood, portion)
      lastEntryRef.current = entry

      setToast({
        visible: true,
        message: `Added ${selectedFood.name_vi} (${portion})`,
        variant: 'success',
      })

      // Clear search after adding food
      setSearchQuery('')

      setSelectedFood(null)
      setProcessingFoodId(null)
    },
    [selectedFood, addFood]
  )

  const handleClosePicker = useCallback(() => {
    setSelectedFood(null)
    setProcessingFoodId(null)
  }, [])

  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleUndo = useCallback(() => {
    if (lastEntryRef.current) {
      removeLog(lastEntryRef.current.id)
      lastEntryRef.current = null
    }
  }, [removeLog])

  // Only show search results when there's an actual query (not just on focus)
  const hasSearchQuery = searchQuery.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH
  const showSearchResults = hasSearchQuery
  const showFoodGrid = !hasSearchQuery

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 space-y-6">
        {/* Progress summary and meal history */}
        <Dashboard
          dailySummary={dailySummary}
          goals={goals}
          onDeleteLog={removeLog}
        />

        {/* Quick add section with search */}
        <section>
          <h2 className="text-title text-foreground mb-4">Quick Add</h2>

          {/* Search input */}
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onClear={handleSearchClear}
              onSubmit={handleSearchSubmit}
              isLoading={isSearching}
              placeholder="Search food..."
            />
          </div>

          {/* Search results or food grid */}
          {showSearchResults && (
            <SearchResults
              query={searchQuery}
              results={searchResults}
              isLoading={isSearching}
              recentSearches={recentSearches}
              onSelectRecentSearch={handleSelectRecentSearch}
              onDeleteRecentSearch={handleDeleteRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
              onSelectFood={handleSelectFood}
              onClearInput={handleSearchClear}
            />
          )}

          {showFoodGrid && (
            <FoodTileGrid
              allFoods={allFoods}
              recentItems={recentItems}
              onSelectFood={handleSelectFood}
              disabledFoodId={processingFoodId}
            />
          )}
        </section>
      </main>

      {/* Portion picker bottom sheet */}
      <PortionPicker
        food={selectedFood}
        isOpen={selectedFood !== null}
        onSelect={handleSelectPortion}
        onClose={handleClosePicker}
      />

      {/* Toast notification */}
      <Toast
        toast={toast}
        onClose={handleCloseToast}
        onUndo={handleUndo}
      />
    </div>
  )
}

export default App
