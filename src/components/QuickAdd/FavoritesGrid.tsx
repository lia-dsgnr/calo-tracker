/**
 * FavoritesGrid - Grid display of user's favorite foods.
 * Shows favorites in a responsive grid with category icons, usage counts, and edit mode.
 * When empty, shows suggestions with option to hide completely.
 */

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
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

/**
 * Favorites grid component with compact card layout.
 * Displays favorites with remove/log actions, shows suggestions when empty.
 */
export function FavoritesGrid({
  onSelectFood,
}: FavoritesGridProps) {
  const { favorites, isLoading, error, refresh } = useFavorites(8)
  const { currentUser } = useDatabaseContext()
  const [suggestionsHidden, setSuggestionsHidden] = useState(() => {
    return localStorage.getItem(SUGGESTIONS_HIDDEN_KEY) === 'true'
  })
  // Track whether SuggestionsGrid currently has any visible items
  const [hasVisibleSuggestions, setHasVisibleSuggestions] = useState(true)

  // Callback to refresh favorites when a suggestion is added
  const handleFavoriteAdded = useCallback(() => {
    refresh()
  }, [refresh])

  // Filter out favorites without food data
  const validFavorites = favorites.filter((item) => item.food !== null)

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
      </h2>
      {validFavorites.length > 0 ? (
        /* Responsive grid: 2 columns on mobile, 3 columns on larger screens */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {validFavorites.map(({ favorite, food }) => {
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
      ) : (
        /* Empty favorites state */
        <Card variant="default" className="text-center py-6 mb-6">
          <p className="text-body text-foreground-muted mb-2">
            No favorites yet
          </p>
        </Card>
      )}

      {/* Suggestions section - show unless user hid it or no items left */}
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

      {/* Show suggestions button if hidden */}
      {!shouldShowSuggestions && (
        <button
          onClick={() => {
            localStorage.removeItem(SUGGESTIONS_HIDDEN_KEY)
            setSuggestionsHidden(false)
          }}
          className="text-primary hover:underline text-caption"
        >
          Show suggestions
        </button>
      )}
    </section>
  )
}
