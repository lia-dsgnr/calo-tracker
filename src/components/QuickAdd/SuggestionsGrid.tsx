/**
 * SuggestionsGrid - Grid display of suggested foods for new users.
 * Shows 6 curated foods in responsive grid (2 columns mobile, 3 columns tablet).
 * Only displayed when user has no favorites.
 * Users can hide individual suggestions or add them to favorites.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSuggestions } from '@/hooks/useSuggestions'
import { useDatabaseContext } from '@/contexts/useDatabaseContext'
import { addFavorite, getFavoritesByUser } from '@/db/repositories/favorite-repository'
import { SuggestionTile } from './SuggestionTile'
import { Card } from '@/components/common'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { FoodItem, PortionSize } from '@/types'

const HIDDEN_SUGGESTIONS_KEY = 'calo_hidden_suggestions'

interface SuggestionsGridProps {
  onSelectFood: (food: FoodItem) => void
  onQuickLog: (food: FoodItem, portion: PortionSize) => void
  onFavoriteAdded?: () => void
}

/**
 * Suggestions grid component for empty favorites state.
 * Displays curated food suggestions to help users get started.
 */
export function SuggestionsGrid({
  onSelectFood,
  onQuickLog,
  onFavoriteAdded,
}: SuggestionsGridProps) {
  const { suggestions, isLoading, error } = useSuggestions()
  const { currentUser, isInitialised } = useDatabaseContext()

  // Track favorited food IDs
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())

  // Load favorited IDs when user is available
  useEffect(() => {
    async function loadFavoritedIds() {
      if (!isInitialised || !currentUser) {
        setFavoritedIds(new Set())
        return
      }

      try {
        const favorites = await getFavoritesByUser(currentUser.id)
        const ids = new Set(favorites.map((f) => f.foodId))
        setFavoritedIds(ids)
      } catch (err) {
        console.error('Error loading favorites:', err)
        setFavoritedIds(new Set())
      }
    }

    loadFavoritedIds()
  }, [isInitialised, currentUser])

  // Load hidden suggestion IDs from localStorage
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_SUGGESTIONS_KEY)
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        return new Set(ids)
      }
    } catch {
      // Ignore corrupted localStorage data
    }
    return new Set<string>()
  })

  // Filter out hidden suggestions
  const visibleSuggestions = useMemo(() => {
    return suggestions.filter((food) => !hiddenIds.has(food.id))
  }, [suggestions, hiddenIds])

  // Handle adding food to favorites
  const handleAddFavorite = useCallback(
    async (food: FoodItem) => {
      if (!currentUser) return

      await addFavorite(currentUser.id, 'system', food.id)

      // Update local favorited state
      setFavoritedIds((prev) => new Set(prev).add(food.id))

      trackEvent('suggestion_favorited', {
        food_id: food.id,
        category: food.category,
      })

      // Notify parent to refresh favorites (but don't remove from suggestions)
      onFavoriteAdded?.()
    },
    [currentUser, onFavoriteAdded]
  )

  // Handle hiding a suggestion
  const handleRemove = useCallback(
    (food: FoodItem) => {
      // Add to hidden set
      const newHiddenIds = new Set(hiddenIds)
      newHiddenIds.add(food.id)
      setHiddenIds(newHiddenIds)

      // Persist to localStorage
      try {
        localStorage.setItem(
          HIDDEN_SUGGESTIONS_KEY,
          JSON.stringify(Array.from(newHiddenIds))
        )
      } catch {
        // Ignore localStorage errors
      }

      trackEvent('quickadd_suggestion_hidden', {
        food_id: food.id,
      })
    },
    [hiddenIds]
  )

  // Loading state: skeleton tiles
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 gap-3',
          'animate-pulse'
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} variant="default" className="min-h-[80px] aspect-square">
            <span className="sr-only">Loading...</span>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card variant="default" className="text-center py-8">
        <p className="text-body text-foreground-muted">
          Couldn't load suggestions
        </p>
      </Card>
    )
  }

  // Empty state (should not happen with curated list)
  if (suggestions.length === 0) {
    return null
  }

  // All suggestions hidden
  if (visibleSuggestions.length === 0) {
    return null
  }

  // Normal state: display suggestions grid
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3')}>
      {visibleSuggestions.map((food) => (
        <SuggestionTile
          key={food.id}
          food={food}
          onSelect={onSelectFood}
          onQuickLog={onQuickLog}
          onAddFavorite={handleAddFavorite}
          onRemove={handleRemove}
          isFavorited={favoritedIds.has(food.id)}
        />
      ))}
    </div>
  )
}
