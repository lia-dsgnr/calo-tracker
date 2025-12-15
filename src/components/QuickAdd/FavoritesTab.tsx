/**
 * FavoritesTab - Dedicated view for user's favorite foods.
 * Displays favorites in a grid with heart icons for removal and one-tap logging.
 */

import { useCallback } from 'react'
import { Heart, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodType } from '@/db/types'

// Unified favorite display item
export interface FavoriteDisplayItem {
  id: string
  foodId: string
  foodType: FoodType
  name: string
  nameEn?: string
  kcal: number
  protein: number
}

interface FavoritesTabProps {
  favorites: FavoriteDisplayItem[]
  favoriteCount: number
  maxFavorites: number
  onSelect: (item: FavoriteDisplayItem) => void
  onRemove: (item: FavoriteDisplayItem) => void
  isLoading?: boolean
}

export function FavoritesTab({
  favorites,
  favoriteCount,
  maxFavorites,
  onSelect,
  onRemove,
  isLoading = false,
}: FavoritesTabProps) {
  /**
   * Handle favorite item click for logging.
   */
  const handleSelect = useCallback(
    (item: FavoriteDisplayItem) => {
      onSelect(item)
    },
    [onSelect]
  )

  /**
   * Handle heart click for removal.
   */
  const handleRemove = useCallback(
    (event: React.MouseEvent, item: FavoriteDisplayItem) => {
      event.stopPropagation()
      onRemove(item)
    },
    [onRemove]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-foreground-muted">
          Loading favorites...
        </div>
      </div>
    )
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-20 flex items-center justify-center mb-4">
          <Star size={24} className="text-yellow-60" />
        </div>
        <p className="text-body text-foreground mb-2">No favorites yet</p>
        <p className="text-caption text-foreground-muted">
          Tap the heart icon on any food to add it to your favorites for quick access
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Count indicator */}
      <p className="text-caption text-foreground-muted px-1">
        {favoriteCount} / {maxFavorites} favorites
      </p>

      {/* Favorites grid */}
      <div className="grid grid-cols-2 gap-3">
        {favorites.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item)}
            className={cn(
              'w-full bg-background-card rounded-card shadow-tile',
              'p-4 text-left transition-all duration-150',
              'min-h-[72px] tap-highlight-none',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'hover:shadow-card active:scale-[0.97] active:shadow-none'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Food name */}
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-body text-foreground font-medium leading-tight line-clamp-2">
                    {item.name}
                  </p>
                  {/* Source badge */}
                  {item.foodType === 'custom' && (
                    <span className="inline-flex px-1.5 py-0.5 rounded-chip bg-purple-20 text-purple-70 text-xs shrink-0">
                      Custom
                    </span>
                  )}
                </div>

                {/* Nutrition info */}
                <p className="text-caption text-foreground-muted">
                  {item.kcal} kcal • {item.protein}g protein
                </p>
              </div>

              {/* Filled heart for removal */}
              <button
                type="button"
                onClick={(e) => handleRemove(e, item)}
                className={cn(
                  'p-1.5 rounded-full shrink-0',
                  'flex items-center justify-center',
                  'hover:bg-gray-20',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                )}
                aria-label={`Remove ${item.name} from favorites`}
              >
                <Heart
                  size={18}
                  className="fill-secondary text-secondary transition-all duration-150"
                />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
