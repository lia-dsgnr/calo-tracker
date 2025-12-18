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
import type { FoodItem, PortionSize } from '@/types'

interface FavoritesGridProps {
  onSelectFood: (food: FoodItem) => void
  onQuickLog: (food: FoodItem, portion: PortionSize) => void
}

const SUGGESTIONS_HIDDEN_KEY = 'calo_suggestions_hidden'

/**
 * Favorites grid component with compact card layout.
 * Displays favorites with remove/log actions, shows suggestions when empty.
 */
export function FavoritesGrid({
  onSelectFood,
  onQuickLog,
}: FavoritesGridProps) {
  const { favorites, isLoading, error, refresh } = useFavorites(8)
  const { currentUser } = useDatabaseContext()
  const [suggestionsHidden, setSuggestionsHidden] = useState(() => {
    return localStorage.getItem(SUGGESTIONS_HIDDEN_KEY) === 'true'
  })

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

  // Empty state: show suggestions or hidden message
  if (!isLoading && !error && validFavorites.length === 0) {
    // User chose to hide suggestions
    if (suggestionsHidden) {
      return (
        <section className="mb-8">
          <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
            <span>❤️</span> Favorites
          </h2>
          <Card variant="default" className="text-center py-6">
            <p className="text-body text-foreground-muted mb-2">
              No favorites yet
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(SUGGESTIONS_HIDDEN_KEY)
                setSuggestionsHidden(false)
              }}
              className="text-primary hover:underline text-caption"
            >
              Show suggestions
            </button>
          </Card>
        </section>
      )
    }

    // Show suggestions with hide option
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title text-foreground flex items-center gap-2">
            <span>❤️</span> Favorites
          </h2>
          <IconButton
            icon={<X size={16} />}
            onClick={handleHideSuggestions}
            aria-label="Hide suggestions"
            variant="ghost"
            size="sm"
          />
        </div>
        <div className="space-y-3">
          <p className="text-caption text-foreground-muted">
            Try these popular foods, or tap ❤️ on any food to add it here
          </p>
          <SuggestionsGrid
            onSelectFood={onSelectFood}
            onQuickLog={onQuickLog}
            onFavoriteAdded={handleFavoriteAdded}
          />
        </div>
      </section>
    )
  }

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

  // Normal state: display favorites as grid
  return (
    <section className="mb-8">
      <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
        <span>❤️</span> Favorites
      </h2>
      {/* Responsive grid: 2 columns on mobile, 3 columns on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {validFavorites.map(({ favorite, food }) => {
          if (!food) return null

          const portionSize =
            favorite.defaultPortion === 'single' ? 'M' : favorite.defaultPortion

          return (
            <FavoriteCard
              key={favorite.id}
              food={food}
              useCount={favorite.useCount}
              defaultPortion={portionSize}
              onSelect={onSelectFood}
              onQuickLog={onQuickLog}
              onRemove={handleRemoveFavorite}
            />
          )
        })}
      </div>
    </section>
  )
}
