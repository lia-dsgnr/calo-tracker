/**
 * QuickAddPage - Main container for food logging flow.
 * Orchestrates: search -> tile selection -> portion picker -> toast notification.
 * Manages debouncing, undo state, and database integration.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { FoodTileGrid } from './FoodTileGrid'
import { PortionPicker } from './PortionPicker'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'
import { Toast } from '@/components/common/Toast'
import { useDatabaseStorage } from '@/hooks'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
} from '@/db'
import type { RecentSearch } from '@/db/types'
import { formatNumber } from '@/lib/utils'
import { searchFoods, SEARCH_CONSTANTS } from '@/lib/search'
import type { FoodItem, PortionSize, ToastState, LogEntry } from '@/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

export function QuickAddPage() {
  // Database storage hook provides logs, recent items, foods, and mutation functions
  const {
    recentItems,
    addFood,
    removeLog,
    dailySummary,
    goals,
    allFoods,
  } = useDatabaseStorage()

  // Current user for recent searches
  const currentUser = useCurrentUser()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Selected food for portion picker (null when picker is closed)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Track last added entry for undo functionality
  const lastEntryRef = useRef<LogEntry | null>(null)

  // Debounce ref to prevent rapid-fire tile taps
  const lastTapTimeRef = useRef<number>(0)

  // Track which food is currently being processed (for disabled state)
  const [processingFoodId, setProcessingFoodId] = useState<string | null>(null)

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

  /**
   * Handle search query change (debounced from SearchInput)
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setIsSearching(query.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH)

    // Clear searching state after short delay (simulates search completion)
    if (query.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      setTimeout(() => setIsSearching(false), 100)
    }
  }, [])

  /**
   * Handle search submit (Enter key) - saves to recent searches
   */
  const handleSearchSubmit = useCallback(async () => {
    const trimmed = searchQuery.trim()
    if (trimmed.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      await addRecentSearch(currentUser.id, trimmed)
      const searches = await getRecentSearches(currentUser.id)
      setRecentSearches(searches)
    }
  }, [searchQuery, currentUser.id])

  /**
   * Handle search input focus
   */
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true)
  }, [])

  /**
   * Handle search input blur
   */
  const handleSearchBlur = useCallback(() => {
    // Delay blur to allow click events on results to fire
    setTimeout(() => {
      setIsSearchFocused(false)
    }, 150)
  }, [])

  /**
   * Handle search clear
   */
  const handleSearchClear = useCallback(() => {
    setSearchQuery('')
    setIsSearching(false)
  }, [])

  /**
   * Handle selecting a recent search term
   */
  const handleSelectRecentSearch = useCallback((term: string) => {
    setSearchQuery(term)
  }, [])

  /**
   * Handle deleting a recent search
   */
  const handleDeleteRecentSearch = useCallback(
    async (id: number) => {
      await deleteRecentSearch(id)
      const searches = await getRecentSearches(currentUser.id)
      setRecentSearches(searches)
    },
    [currentUser.id]
  )

  /**
   * Handle clearing all recent searches
   */
  const handleClearRecentSearches = useCallback(async () => {
    await clearRecentSearches(currentUser.id)
    setRecentSearches([])
  }, [currentUser.id])

  /**
   * Handle food tile selection - opens portion picker with debouncing.
   */
  const handleSelectFood = useCallback((food: FoodItem) => {
    const now = Date.now()

    // Debounce: ignore taps within 200ms of the last tap
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) {
      return
    }
    lastTapTimeRef.current = now

    setSelectedFood(food)
    setProcessingFoodId(food.id)
  }, [])

  /**
   * Handle portion selection - logs the food and shows toast.
   */
  const handleSelectPortion = useCallback(
    async (portion: PortionSize) => {
      if (!selectedFood) return

      // Add food to log via storage hook
      const entry = await addFood(selectedFood, portion)
      if (entry) {
        lastEntryRef.current = entry

        // Show success toast with undo option
        setToast({
          visible: true,
          message: `Added ${selectedFood.name_vi} (${portion})`,
          variant: 'success',
          undoAction: () => {
            // Undo action will be called via handleUndo
          },
        })

        // Save search term to recent searches if we were searching
        if (searchQuery.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
          await addRecentSearch(currentUser.id, searchQuery.trim())
          const searches = await getRecentSearches(currentUser.id)
          setRecentSearches(searches)
        }

        // Clear search and close picker
        setSearchQuery('')
        setIsSearchFocused(false)
      }

      // Close picker and clear processing state
      setSelectedFood(null)
      setProcessingFoodId(null)
    },
    [selectedFood, addFood, searchQuery, currentUser.id]
  )

  /**
   * Handle portion picker close without selection.
   */
  const handleClosePicker = useCallback(() => {
    setSelectedFood(null)
    setProcessingFoodId(null)
  }, [])

  /**
   * Handle toast dismissal.
   */
  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  /**
   * Handle undo action - removes the last logged entry.
   */
  const handleUndo = useCallback(async () => {
    if (lastEntryRef.current) {
      await removeLog(lastEntryRef.current.id)
      lastEntryRef.current = null
    }
  }, [removeLog])

  // Calculate progress display values
  const progressPercent = useMemo(() => {
    return Math.min(100, (dailySummary.consumedKcal / goals.dailyKcal) * 100)
  }, [dailySummary.consumedKcal, goals.dailyKcal])

  // Determine what content to show
  const showSearchResults =
    isSearchFocused ||
    searchQuery.trim().length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH
  const showFoodGrid = !showSearchResults

  return (
    <div className="min-h-screen bg-background">
      {/* Header with daily progress summary */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4">
          <h1 className="text-headline text-foreground mb-2">Quick Add</h1>

          {/* Daily progress bar - condensed view */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-caption text-foreground-muted whitespace-nowrap">
              {formatNumber(dailySummary.consumedKcal)} /{' '}
              {formatNumber(goals.dailyKcal)} kcal
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="px-5 pb-4">
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
      </header>

      {/* Main content - conditional: search results or food grid */}
      <main className="px-5 py-6">
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
      </main>

      {/* Portion picker bottom sheet */}
      <PortionPicker
        food={selectedFood}
        isOpen={selectedFood !== null}
        onSelect={handleSelectPortion}
        onClose={handleClosePicker}
      />

      {/* Toast notification */}
      <Toast toast={toast} onClose={handleCloseToast} onUndo={handleUndo} />
    </div>
  )
}
