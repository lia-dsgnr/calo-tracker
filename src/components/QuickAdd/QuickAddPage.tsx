/**
 * QuickAddPage - Main container for food logging flow.
 * Orchestrates: search, tabs, tile selection -> portion picker -> toast notification.
 * Manages search state, favorites, and tab navigation.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { FoodTileGrid } from './FoodTileGrid'
import { PortionPicker } from './PortionPicker'
import { SearchBar } from './SearchBar'
import { SearchResults, type SearchResult } from './SearchResults'
import { TabBar, type TabId } from './TabBar'
import { FavoritesTab, type FavoriteDisplayItem } from './FavoritesTab'
import { Toast } from '@/components/common/Toast'
import { ManualEntryModal, type ManualEntryFormData } from './ManualEntryModal'
import { useSearch, useFavorites } from '@/hooks'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import { toggleFavorite, getFavoriteCount } from '@/db/repositories/favorite-repository'
import { createLog } from '@/db/repositories/log-repository'
import {
  getSystemFoodById,
  getCustomFoodById,
  createCustomFood,
  deleteCustomFood,
  getCustomFoodCount,
} from '@/db/repositories/food-repository'
import type { FoodItem, PortionSize, ToastState, LogEntry, RecentItem } from '@/types'
import type { CustomFood } from '@/db/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

// Warning threshold for favorites limit
const FAVORITES_WARNING_THRESHOLD = 18

interface QuickAddPageProps {
  recentItems: RecentItem[]
  addFood: (food: FoodItem, portion: PortionSize) => Promise<LogEntry | null>
  removeLog: (entryId: string) => Promise<void>
}

export function QuickAddPage({ recentItems, addFood, removeLog }: QuickAddPageProps) {
  const currentUser = useCurrentUser()

  // Search hook provides search state and recent searches
  const {
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
  } = useSearch()

  // Favorites hook provides favorites data and actions
  const {
    favorites,
    favoriteCount,
    maxFavorites,
    removeFromFavorites,
    refreshFavorites,
    toggleFavoriteStatus,
  } = useFavorites()

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabId>('all')

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

  // Manual entry modal state
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
  const [customFoodCount, setCustomFoodCount] = useState(0)

  // Tab configuration with favorite count
  const tabs = useMemo(
    () => [
      { id: 'all' as TabId, label: 'All' },
      { id: 'recent' as TabId, label: 'Recent' },
      { id: 'favorites' as TabId, label: 'Favorites', count: favoriteCount },
    ],
    [favoriteCount]
  )

  /**
   * Convert system foods to FoodItem format for legacy components.
   */
  const allFoods: FoodItem[] = useMemo(() => {
    return systemFoods.map((sf) => ({
      id: sf.id,
      name_vi: sf.nameVi,
      name_en: sf.nameEn,
      category: sf.category,
      portions: {
        S: { kcal: sf.kcalS, protein: sf.proteinS, fat: sf.fatS, carbs: sf.carbsS },
        M: { kcal: sf.kcalM, protein: sf.proteinM, fat: sf.fatM, carbs: sf.carbsM },
        L: { kcal: sf.kcalL, protein: sf.proteinL, fat: sf.fatL, carbs: sf.carbsL },
      },
      serving: sf.servingDescription ?? '',
      confidence: sf.confidence,
    }))
  }, [systemFoods])

  /**
   * Convert custom foods to FoodItem format.
   * Custom foods have single portion, so we use the same values for S/M/L.
   */
  const customFoodItems: FoodItem[] = useMemo(() => {
    return customFoods.map((cf) => {
      const nutrition = {
        kcal: cf.kcal,
        protein: cf.protein ?? 0,
        fat: cf.fat ?? 0,
        carbs: cf.carbs ?? 0,
      }
      return {
        id: cf.id,
        name_vi: cf.name,
        name_en: '', // Custom foods don't have English names
        category: 'clean_eating' as const, // Use a default category for type compatibility
        portions: {
          S: nutrition,
          M: nutrition,
          L: nutrition,
        },
        serving: '',
        confidence: 1.0, // User-provided data is always 100% confidence
      }
    })
  }, [customFoods])

  /**
   * Create a Set of favorited food IDs for quick lookup.
   * Used to determine if a food tile should show filled heart icon.
   */
  const favoritedFoodIds = useMemo(() => {
    return new Set(favorites.map((fav) => fav.foodId))
  }, [favorites])

  /**
   * Log a custom food directly (no portion picker).
   * Defined before handleSelectSearchResult to satisfy hook ordering.
   */
  const logCustomFood = useCallback(
    async (customFood: CustomFood) => {
      try {
        const log = await createLog({
          userId: currentUser.id,
          foodType: 'custom',
          foodId: customFood.id,
          portion: 'single',
          nameSnapshot: customFood.name,
          kcal: customFood.kcal,
          protein: customFood.protein ?? 0,
          fat: customFood.fat ?? 0,
          carbs: customFood.carbs ?? 0,
        })

        if (log) {
          // Store entry for undo
          const entry: LogEntry = {
            id: log.id,
            foodId: log.foodId,
            name_vi: log.nameSnapshot,
            portion: 'single' as PortionSize,
            kcal: log.kcal,
            protein: log.protein,
            carbs: log.carbs,
            fat: log.fat,
            timestamp: log.loggedAt,
          }
          lastEntryRef.current = entry

          setToast({
            visible: true,
            message: `Added ${customFood.name}`,
            variant: 'success',
            undoAction: true,
          })
        }

        // Clear search
        setQuery('')
      } catch (error) {
        console.error('Failed to log custom food:', error)
        setToast({
          visible: true,
          message: 'Failed to add food',
          variant: 'error',
        })
      }
    },
    [currentUser.id, setQuery]
  )

  /**
   * Track if selected food is custom (for portion picker display).
   */
  const [isSelectedFoodCustom, setIsSelectedFoodCustom] = useState(false)

  /**
   * Handle food tile selection - opens portion picker for both system and custom foods.
   * Custom foods show a single "Add" button instead of S/M/L options.
   */
  const handleSelectFood = useCallback((food: FoodItem) => {
    const now = Date.now()

    // Debounce: ignore taps within 200ms of the last tap
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) {
      return
    }
    lastTapTimeRef.current = now

    // Check if this is a custom food by looking it up in customFoods array
    const isCustom = customFoods.some((cf) => cf.id === food.id)

    // Open portion picker for both system and custom foods
    setSelectedFood(food)
    setIsSelectedFoodCustom(isCustom)
    setProcessingFoodId(food.id)
  }, [customFoods])

  /**
   * Handle search result selection.
   */
  const handleSelectSearchResult = useCallback(
    async (result: SearchResult) => {
      // Save the search term to recent searches
      if (query.trim()) {
        await saveRecentSearch(query)
      }

      if (result.foodType === 'system') {
        // Fetch full system food data and open portion picker
        const systemFood = await getSystemFoodById(result.id)
        if (systemFood) {
          // Convert to FoodItem for PortionPicker
          const foodItem: FoodItem = {
            id: systemFood.id,
            name_vi: systemFood.nameVi,
            name_en: systemFood.nameEn,
            category: systemFood.category,
            portions: {
              S: {
                kcal: systemFood.kcalS,
                protein: systemFood.proteinS,
                fat: systemFood.fatS,
                carbs: systemFood.carbsS,
              },
              M: {
                kcal: systemFood.kcalM,
                protein: systemFood.proteinM,
                fat: systemFood.fatM,
                carbs: systemFood.carbsM,
              },
              L: {
                kcal: systemFood.kcalL,
                protein: systemFood.proteinL,
                fat: systemFood.fatL,
                carbs: systemFood.carbsL,
              },
            },
            serving: systemFood.servingDescription ?? '',
            confidence: systemFood.confidence,
          }
          setSelectedFood(foodItem)
          setProcessingFoodId(result.id)
        }
      } else {
        // Custom food - log directly without portion picker
        const customFood = customFoods.find((cf) => cf.id === result.id)
        if (customFood) {
          await logCustomFood(customFood)
        }
      }
    },
    [query, saveRecentSearch, customFoods, logCustomFood]
  )

  /**
   * Handle portion selection - logs the food and shows toast.
   * For custom foods, uses 'single' portion type; for system foods, uses selected portion.
   * Database storage requires async operations.
   */
  const handleSelectPortion = useCallback(
    async (portion: PortionSize) => {
      if (!selectedFood) return

      try {
        // For custom foods, log directly using the custom food data
        if (isSelectedFoodCustom) {
          const customFood = customFoods.find((cf) => cf.id === selectedFood.id)
          if (customFood) {
            await logCustomFood(customFood)
            // Close picker and clear processing state
            setSelectedFood(null)
            setIsSelectedFoodCustom(false)
            setProcessingFoodId(null)
            return
          }
        }

        // For system foods, use the storage hook
        const entry = await addFood(selectedFood, portion)
        if (entry) {
          lastEntryRef.current = entry

          // Show success toast with undo option
          setToast({
            visible: true,
            message: `Added ${selectedFood.name_vi} (${portion})`,
            variant: 'success',
            undoAction: true,
          })

          // Close picker and clear processing state
          setSelectedFood(null)
          setIsSelectedFoodCustom(false)
          setProcessingFoodId(null)

          // Clear search
          setQuery('')
        }
      } catch (error) {
        console.error('Failed to add food:', error)
        setToast({
          visible: true,
          message: 'Failed to add food',
          variant: 'error',
        })
      }
    },
    [selectedFood, isSelectedFoodCustom, customFoods, logCustomFood, addFood, setQuery]
  )

  /**
   * Handle portion picker close without selection.
   */
  const handleClosePicker = useCallback(() => {
    setSelectedFood(null)
    setIsSelectedFoodCustom(false)
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
   * Database storage requires async operations.
   */
  const handleUndo = useCallback(async () => {
    if (lastEntryRef.current) {
      try {
        await removeLog(lastEntryRef.current.id)
        lastEntryRef.current = null
      } catch (error) {
        console.error('Failed to undo log:', error)
      }
    }
  }, [removeLog])

  /**
   * Handle favorite toggle from search results.
   */
  const handleFavoriteToggle = useCallback(
    async (result: SearchResult) => {
      try {
        // Check if approaching limit
        const count = await getFavoriteCount(currentUser.id)
        if (!result.isFavorited && count >= FAVORITES_WARNING_THRESHOLD) {
          const remaining = 20 - count
          if (remaining > 0 && remaining <= 2) {
            setToast({
              visible: true,
              message: `${remaining} favorite slot${remaining === 1 ? '' : 's'} remaining`,
              variant: 'success',
            })
          }
        }

        const favorite = await toggleFavorite(currentUser.id, result.foodType, result.id)

        // Refresh foods to update isFavorited status and favorites list for real-time updates
        await Promise.all([refreshFoods(), refreshFavorites()])

        setToast({
          visible: true,
          message: favorite ? 'Added to favorites' : 'Removed from favorites',
          variant: 'success',
        })
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        setToast({
          visible: true,
          message: 'Failed to update favorites',
          variant: 'error',
        })
      }
    },
    [currentUser.id, refreshFoods, refreshFavorites]
  )

  /**
   * Load custom food count for limit checking.
   */
  const loadCustomFoodCount = useCallback(async () => {
    if (!currentUser) return
    const count = await getCustomFoodCount(currentUser.id)
    setCustomFoodCount(count)
  }, [currentUser])

  // Load custom food count when modal opens
  useEffect(() => {
    if (isManualEntryOpen) {
      loadCustomFoodCount()
    }
  }, [isManualEntryOpen, loadCustomFoodCount])

  /**
   * Handle manual entry save - creates custom food, logs entry, conditionally soft-deletes.
   */
  const handleManualEntrySave = useCallback(
    async (formData: ManualEntryFormData) => {
      if (!currentUser) return

      try {
        // Parse numeric values
        const kcal = parseFloat(formData.kcal)
        const protein = formData.protein.trim() ? parseFloat(formData.protein) : null
        const carbs = formData.carbs.trim() ? parseFloat(formData.carbs) : null
        const fat = formData.fat.trim() ? parseFloat(formData.fat) : null

        // Always create a custom food (required for foodId in log)
        // If at limit and "Save as custom" is checked, we still create it temporarily
        // then soft-delete it after logging (per edge case E7)
        const customFood = await createCustomFood(currentUser.id, {
          name: formData.name.trim(),
          kcal,
          protein: protein ?? undefined,
          carbs: carbs ?? undefined,
          fat: fat ?? undefined,
        })

        if (!customFood) {
          // At limit - this should be rare if checkbox is properly disabled
          // But if it happens, we can't log without a foodId
          // Show error and don't proceed
          setToast({
            visible: true,
            message: 'Custom food limit reached. Please remove a custom food first.',
            variant: 'error',
          })
          return
        }

        // Log the entry
        const log = await createLog({
          userId: currentUser.id,
          foodType: 'custom',
          foodId: customFood.id,
          portion: 'single',
          nameSnapshot: formData.name.trim(),
          kcal,
          protein: protein ?? 0,
          fat: fat ?? 0,
          carbs: carbs ?? 0,
        })

        if (!log) {
          // Daily log limit reached
          setToast({
            visible: true,
            message: 'Daily log limit reached (30 max)',
            variant: 'error',
          })
          // Clean up custom food if log failed
          await deleteCustomFood(customFood.id)
          return
        }

        // If "Save as custom" is unchecked, OR if we're at limit (edge case E7),
        // soft-delete the custom food to keep it out of custom foods list
        // This preserves the foodId in the log while not consuming the limit
        const isAtLimit = customFoodCount >= 30
        if (!formData.saveAsCustom || isAtLimit) {
          await deleteCustomFood(customFood.id)
        }

        // Update local state
        const entry: LogEntry = {
          id: log.id,
          foodId: log.foodId,
          name_vi: log.nameSnapshot,
          portion: 'single' as PortionSize,
          kcal: log.kcal,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
          timestamp: log.loggedAt,
        }
        lastEntryRef.current = entry

        // Show success toast with custom food save message if applicable
        let message = `Added ${formData.name.trim()}`
        // Only show "Saved to custom foods" if actually saved (not soft-deleted)
        if (formData.saveAsCustom && !isAtLimit) {
          message += ' • Saved to custom foods'
        }

        setToast({
          visible: true,
          message,
          variant: 'success',
          undoAction: true,
        })

        // Refresh foods to update custom foods list if actually saved (not soft-deleted)
        if (formData.saveAsCustom && !isAtLimit) {
          await refreshFoods()
          await loadCustomFoodCount()
        } else if (isAtLimit) {
          // Still refresh count even if we soft-deleted (to update the UI)
          await loadCustomFoodCount()
        }

        // Clear search
        setQuery('')
      } catch (error) {
        console.error('Failed to save manual entry:', error)
        setToast({
          visible: true,
          message: 'Failed to add food',
          variant: 'error',
        })
      }
    },
    [currentUser, refreshFoods, loadCustomFoodCount, setQuery]
  )

  /**
   * Handle manual entry click - pre-fills name from search query and opens modal.
   */
  const handleManualEntryClick = useCallback(() => {
    setIsManualEntryOpen(true)
  }, [])

  /**
   * Handle recent search click.
   */
  const handleRecentSearchClick = useCallback(
    (term: string) => {
      setQuery(term)
    },
    [setQuery]
  )

  /**
   * Handle favorite item selection - opens portion picker for system foods,
   * logs directly for custom foods.
   */
  const handleSelectFavorite = useCallback(
    async (item: FavoriteDisplayItem) => {
      if (item.foodType === 'system') {
        // Fetch full system food data and open portion picker
        const systemFood = await getSystemFoodById(item.foodId)
        if (systemFood) {
          // Convert to FoodItem for PortionPicker
          const foodItem: FoodItem = {
            id: systemFood.id,
            name_vi: systemFood.nameVi,
            name_en: systemFood.nameEn,
            category: systemFood.category,
            portions: {
              S: {
                kcal: systemFood.kcalS,
                protein: systemFood.proteinS,
                fat: systemFood.fatS,
                carbs: systemFood.carbsS,
              },
              M: {
                kcal: systemFood.kcalM,
                protein: systemFood.proteinM,
                fat: systemFood.fatM,
                carbs: systemFood.carbsM,
              },
              L: {
                kcal: systemFood.kcalL,
                protein: systemFood.proteinL,
                fat: systemFood.fatL,
                carbs: systemFood.carbsL,
              },
            },
            serving: systemFood.servingDescription ?? '',
            confidence: systemFood.confidence,
          }
          setSelectedFood(foodItem)
          setProcessingFoodId(item.foodId)
        }
      } else {
        // Custom food - log directly without portion picker
        const customFood = await getCustomFoodById(item.foodId)
        if (customFood) {
          await logCustomFood(customFood)
        }
      }
    },
    [logCustomFood]
  )

  /**
   * Handle favorite removal - silent operation per spec.
   */
  const handleRemoveFavorite = useCallback(
    async (item: FavoriteDisplayItem) => {
      try {
        await removeFromFavorites(item.foodType, item.foodId)
        // Silent removal - no toast notification
      } catch (error) {
        console.error('Failed to remove favorite:', error)
      }
    },
    [removeFromFavorites]
  )

  /**
   * Handle favorite toggle from food tiles in grid.
   * Uses toggleFavoriteStatus from hook which handles limit checks and warnings.
   */
  const handleFoodTileFavoriteToggle = useCallback(
    async (food: FoodItem, foodType: 'system' | 'custom') => {
      try {
        const result = await toggleFavoriteStatus(foodType, food.id)

        // Show warning toast if approaching limit
        if (result.showWarning) {
          setToast({
            visible: true,
            message: `${result.slotsRemaining} favorite slot${result.slotsRemaining === 1 ? '' : 's'} remaining`,
            variant: 'success',
          })
        } else if (result.isAtLimit) {
          // Show error if at limit
          setToast({
            visible: true,
            message: 'Favorite limit reached (20 max)',
            variant: 'error',
          })
        } else if (result.isFavorited) {
          // Show success when added
          setToast({
            visible: true,
            message: 'Added to favorites',
            variant: 'success',
          })
        }
        // Silent removal - no toast when removing

        // Refresh foods to update favorite status in search results
        await refreshFoods()
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        setToast({
          visible: true,
          message: 'Failed to update favorites',
          variant: 'error',
        })
      }
    },
    [toggleFavoriteStatus, refreshFoods]
  )

  // Determine what content to show based on search state and active tab
  const showSearchResults = hasSearched && query.trim().length > 0

  return (
    <section className="space-y-6">
      {/* Header with search and tabs */}
      <div>
        <h2 className="text-title text-foreground mb-4">Quick Add</h2>

        {/* Search bar */}
        <div className="mb-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            recentSearches={recentSearches}
            onRecentClick={handleRecentSearchClick}
            onClearRecent={deleteRecentSearchItem}
            onClearAllRecent={clearAllRecentSearches}
            placeholder="Search foods..."
          />
        </div>

        {/* Tab bar - hidden when showing search results */}
        {!showSearchResults && (
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>

      {/* Main content */}
      <div>
        {showSearchResults ? (
          // Search results view
          <SearchResults
            results={results}
            query={query}
            isLoading={isSearching}
            onSelect={handleSelectSearchResult}
            onFavoriteToggle={handleFavoriteToggle}
            onManualEntryClick={handleManualEntryClick}
          />
        ) : (
          // Tab content view
          <>
            {activeTab === 'all' && (
              <FoodTileGrid
                allFoods={allFoods}
                recentItems={recentItems}
                onSelectFood={handleSelectFood}
                disabledFoodId={processingFoodId}
                favoritedFoodIds={favoritedFoodIds}
                onFavoriteToggle={handleFoodTileFavoriteToggle}
                customFoods={customFoodItems}
                hideRecent
              />
            )}
            {activeTab === 'recent' && (
              <FoodTileGrid
                allFoods={allFoods}
                recentItems={recentItems}
                onSelectFood={handleSelectFood}
                disabledFoodId={processingFoodId}
                showOnlyRecent
                favoritedFoodIds={favoritedFoodIds}
                onFavoriteToggle={handleFoodTileFavoriteToggle}
                customFoods={customFoodItems}
              />
            )}
            {activeTab === 'favorites' && (
              <FavoritesTab
                favorites={favorites}
                favoriteCount={favoriteCount}
                maxFavorites={maxFavorites}
                onSelect={handleSelectFavorite}
                onRemove={handleRemoveFavorite}
              />
            )}
          </>
        )}
      </div>

      {/* Portion picker bottom sheet */}
      <PortionPicker
        food={selectedFood}
        isOpen={selectedFood !== null}
        onSelect={handleSelectPortion}
        onClose={handleClosePicker}
        isCustomFood={isSelectedFoodCustom}
      />

      {/* Manual entry modal */}
      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSave={handleManualEntrySave}
        prefillName={query.trim()}
        isAtCustomFoodLimit={customFoodCount >= 30}
        customFoodCount={customFoodCount}
      />

      {/* Toast notification */}
      <Toast toast={toast} onClose={handleCloseToast} onUndo={handleUndo} />
    </section>
  )
}
