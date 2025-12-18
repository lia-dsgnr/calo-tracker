/**
 * SuggestionTile - Grid card for suggested food items.
 * Displays food with category emoji container, name, calories, heart icon to add to favorites,
 * and remove icon to hide. Similar visual language to FavoriteCard.
 */

import { useCallback } from 'react'
import { X, Heart } from 'lucide-react'
import { Card, IconButton, EmojiContainer } from '@/components/common'
import { cn } from '@/lib/utils'
import { getFoodEmoji } from '@/lib/food-emoji'
import type { FoodItem } from '@/types'

interface SuggestionTileProps {
  food: FoodItem
  onSelect: (food: FoodItem) => void
  onAddFavorite: (food: FoodItem) => void
  onRemove?: (food: FoodItem) => void
  isFavorited?: boolean
  disabled?: boolean
}

/**
 * Suggestion tile component with favorite and remove actions.
 * Uses the shared emoji container so suggestions visually match favorites.
 */
export function SuggestionTile({
  food,
  onSelect,
  onAddFavorite,
  onRemove,
  isFavorited = false,
  disabled = false,
}: SuggestionTileProps) {
  // Handle tile body click: opens portion picker from a suggestion.
  const handleTileClick = useCallback(() => {
    if (!disabled) {
      onSelect(food)
    }
  }, [disabled, food, onSelect])

  // Handle heart icon click: adds a suggestion to favorites without logging.
  const handleAddFavorite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled) {
        onAddFavorite(food)
      }
    },
    [disabled, food, onAddFavorite]
  )

  // Handle remove icon click: hides item from suggestion list while keeping it in the database.
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled && onRemove) {
        onRemove(food)
      }
    },
    [disabled, food, onRemove]
  )

  // M portion is the default display value.
  const displayKcal = food.portions.M.kcal
  const categoryEmoji = getFoodEmoji(food)

  return (
    <Card
      variant="interactive"
      onPress={handleTileClick}
      disabled={disabled}
      className={cn(
        // Grid card layout: vertical stack with floating action icons.
        'relative flex flex-col',
        'p-4',
        'min-h-[120px]'
      )}
    >
      {/* Remove icon - hide from suggestions, top left corner. */}
      {onRemove && (
        <div className="absolute top-2 left-2 z-10">
          <IconButton
            icon={<X size={16} />}
            onClick={handleRemove}
            aria-label={`Hide ${food.name_vi} from suggestions`}
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="active:scale-95 transition-transform duration-100"
          />
        </div>
      )}

      {/* Heart icon - add to favorites, top right corner. */}
      <div className="absolute top-2 right-2 z-10">
        <IconButton
          icon={
            <Heart
              size={16}
              className={cn(isFavorited && 'fill-current')}
            />
          }
          onClick={handleAddFavorite}
          aria-label={
            isFavorited
              ? `${food.name_vi} is in favorites`
              : `Add ${food.name_vi} to favorites`
          }
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            isFavorited
              ? 'text-orange-60 hover:text-orange-70'
              : 'text-foreground-muted hover:text-foreground',
            'active:scale-95 transition-transform duration-100'
          )}
        />
      </div>

      {/* Category emoji in shared container at the top of the tile. */}
      <div className="flex justify-center mb-2">
        <EmojiContainer emoji={categoryEmoji} ariaLabel={food.category} size="md" />
      </div>

      {/* Food name - Vietnamese name, truncated if too long. */}
      <p
        className={cn(
          'text-body text-foreground font-medium',
          'text-center line-clamp-2',
          'mb-1'
        )}
      >
        {food.name_vi}
      </p>

      {/* Calories - smaller text, muted color. */}
      <p className="text-caption text-foreground-muted text-center">
        {displayKcal} kcal
      </p>
    </Card>
  )
}
