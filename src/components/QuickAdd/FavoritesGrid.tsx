/**
 * FavoritesGrid - Grid display of user's favorite foods.
 * Shows favorites in a responsive grid with category icons, usage counts, and edit mode.
 * When empty, shows suggestions with option to hide completely.
 */

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useDatabaseContext } from '@/contexts/useDatabaseContext'
import { removeFavorite } from '@/db/repositories/favorite-repository'
import { FavoriteCard } from './FavoriteCard'
import { SuggestionsGrid } from './SuggestionsGrid'
import { Card, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { FoodItem } from '@/types'

interface FavoritesGridProps {
  onSelectFood: (food: FoodItem) => void
}

const SUGGESTIONS_HIDDEN_KEY = 'calo_suggestions_hidden'
const INITIAL_DISPLAY_LIMIT = 9

/**
 * Favorites grid component with compact card layout.
 * Displays favorites with remove/log actions, shows suggestions when empty.
 * Shows first 9 favorites initially, with "Show all" button to expand.
 */
export function FavoritesGrid({
  onSelectFood,
}: FavoritesGridProps) {
  // Fetch all favorites to support expand/collapse functionality
  const { favorites, isLoading, error, refresh } = useFavorites(null)
  const { currentUser } = useDatabaseContext()
  const [suggestionsHidden, setSuggestionsHidden] = useState(() => {
    return localStorage.getItem(SUGGESTIONS_HIDDEN_KEY) === 'true'
  })
  // Track whether SuggestionsGrid currently has any visible items
  const [hasVisibleSuggestions, setHasVisibleSuggestions] = useState(true)
  // Track expanded state for showing all favorites
  const [isExpanded, setIsExpanded] = useState(false)

  // Callback to refresh favorites when a suggestion is added
  const handleFavoriteAdded = useCallback(() => {
    refresh()
  }, [refresh])

  // Filter out favorites without food data
  const validFavorites = favorites.filter((item) => item.food !== null)

  // Count of valid favorites that can actually be displayed
  // This may differ from totalCount if some favorites have missing food data
  const displayCount = validFavorites.length

  // Determine which favorites to display based on expanded state
  const displayedFavorites = isExpanded
    ? validFavorites
    : validFavorites.slice(0, INITIAL_DISPLAY_LIMIT)

  // Show "Show all" button if there are more favorites than the initial limit
  const hasMoreFavorites = validFavorites.length > INITIAL_DISPLAY_LIMIT

  // Handle expand/collapse toggle
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
    trackEvent('quickadd_favorites_toggle_expand', {
      action: isExpanded ? 'collapse' : 'expand',
    })
  }, [isExpanded])

  // Handle removing a favorite
  const handleRemoveFavorite = useCallback(
    async (food: FoodItem) => {
      if (!currentUser) return

      await removeFavorite(currentUser.id, 'system', food.id)
      trackEvent('quickadd_favorite_removed', { food_id: food.id })
      refresh()
    },
    [currentUser, refresh]
  )


  // Handle hiding suggestions
  const handleHideSuggestions = useCallback(() => {
    localStorage.setItem(SUGGESTIONS_HIDDEN_KEY, 'true')
    setSuggestionsHidden(true)
    trackEvent('quickadd_suggestions_hidden', {})
  }, [])

  // Track section visibility on mount
  useEffect(() => {
    if (!isLoading) {
      trackEvent('quickadd_section_visible', {
        section: 'favorites',
      })
    }
  }, [isLoading])

  // Check if suggestions should be shown
  // Show suggestions only if user has not hidden the section AND there are items left
  const shouldShowSuggestions = !suggestionsHidden && hasVisibleSuggestions

  // Error state
  if (error) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>❤️</span> Favorites
          {displayCount > 0 && (
            <span className="text-body text-foreground-muted font-normal">
              ({displayCount})
            </span>
          )}
        </h2>
        <Card variant="default" className="text-center py-8">
          <p className="text-body text-foreground-muted mb-4">
            Couldn't load favorites
          </p>
          <button
            onClick={refresh}
            className="text-primary hover:underline text-caption"
          >
            Retry
          </button>
        </Card>
      </section>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>❤️</span> Favorites
          {displayCount > 0 && (
            <span className="text-body text-foreground-muted font-normal">
              ({displayCount})
            </span>
          )}
        </h2>
        <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', 'animate-pulse')}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="default" className="h-[120px]">
              <span className="sr-only">Loading...</span>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  // Normal state: display favorites as grid, with suggestions below if enabled
  return (
    <section className="mb-8">
      {/* Favorites section */}
      <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
        <span>❤️</span> Favorites
        {displayCount > 0 && (
          <span className="text-body text-foreground-muted font-normal">
            ({displayCount})
          </span>
        )}
      </h2>
      {validFavorites.length > 0 ? (
        <>
          {/* Responsive grid: 2 columns on mobile, 3 columns on larger screens */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {displayedFavorites.map(({ favorite, food }) => {
              if (!food) return null

              return (
                <FavoriteCard
                  key={favorite.id}
                  food={food}
                  useCount={favorite.useCount}
                  onSelect={onSelectFood}
                  onRemove={handleRemoveFavorite}
                />
              )
            })}
          </div>
          {/* Show all / Show less button */}
          {hasMoreFavorites && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleToggleExpand}
                className="text-primary hover:text-primary/80 text-body flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>Show all</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty favorites state */
        <Card variant="default" className="text-center py-6 mb-6">
          <p className="text-body text-foreground-muted mb-2">
            No favorites yet
          </p>
        </Card>
      )}

      {/* Suggestions section - show unless user hid it or no items left.
          We intentionally do not render a "Show suggestions" button here,
          because favorites should stay focused on saved items once the user
          dismisses suggestions via the close icon. */}
      {shouldShowSuggestions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-caption text-foreground-muted">
              Try these popular foods, or tap ❤️ on any food to add it here
            </p>
            <IconButton
              icon={<X size={16} />}
              onClick={handleHideSuggestions}
              aria-label="Hide suggestions"
              variant="ghost"
              size="sm"
            />
          </div>
          <SuggestionsGrid
            onSelectFood={onSelectFood}
            onFavoriteAdded={handleFavoriteAdded}
            onVisibleChange={setHasVisibleSuggestions}
          />
        </div>
      )}
    </section>
  )
}
