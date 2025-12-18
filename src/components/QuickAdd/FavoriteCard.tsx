/**
 * FavoriteCard - Grid card component for favorite foods.
 * Displays food with category icon, name, calories, usage count, and heart icon to remove.
 * Optimized for grid layout with responsive design.
 */

import { useCallback } from 'react'
import { Heart } from 'lucide-react'
import { Card, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import type { FoodItem, FoodCategory } from '@/types'

// Category emoji mapping for display
const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  noodles: '🍜',
  rice: '🍚',
  banh_mi: '🥖',
  snacks: '🍿',
  drinks: '🧃',
  desserts: '🍰',
  clean_eating: '🥗',
}

/**
 * Get emoji for a food category.
 */
function getCategoryEmoji(category: FoodCategory): string {
  return CATEGORY_EMOJI[category] || '🍽️'
}

interface FavoriteCardProps {
  food: FoodItem
  useCount: number
  onSelect: (food: FoodItem) => void
  onRemove?: (food: FoodItem) => void
  disabled?: boolean
}

/**
 * Favorite card component for grid display.
 * Shows category icon, food name, calories, usage count badge, and heart icon to remove.
 */
export function FavoriteCard({
  food,
  useCount,
  onSelect,
  onRemove,
  disabled = false,
}: FavoriteCardProps) {
  // Handle card click: opens portion picker
  const handleCardClick = useCallback(() => {
    if (!disabled) {
      onSelect(food)
    }
  }, [disabled, food, onSelect])

  // Handle heart icon click: removes from favorites
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled && onRemove) {
        onRemove(food)
      }
    },
    [disabled, food, onRemove]
  )

  // M portion is the default display value
  const displayKcal = food.portions.M.kcal
  const categoryEmoji = getCategoryEmoji(food.category)

  return (
    <Card
      variant="interactive"
      onPress={handleCardClick}
      disabled={disabled}
      className={cn(
        // Grid card layout: vertical stack with relative positioning for badge and heart
        'relative flex flex-col',
        'p-4',
        'min-h-[120px]'
      )}
    >
      {/* Heart icon - remove from favorites, top right corner */}
      {onRemove && (
        <div className="absolute top-2 right-2 z-10">
          <IconButton
            icon={<Heart size={16} className="fill-current" />}
            onClick={handleRemove}
            aria-label={`Remove ${food.name_vi} from favorites`}
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-orange-60 hover:text-orange-70"
          />
        </div>
      )}

      {/* Usage count badge - top left corner (when heart is on right) */}
      {useCount > 0 && (
        <div
          className={cn(
            // Positioned absolutely in top-left
            'absolute top-2 left-2',
            // Badge styling: small, rounded, green background
            'bg-primary/20 text-primary',
            'px-2 py-0.5 rounded-full',
            'text-caption font-medium',
            'z-10'
          )}
        >
          {useCount}x
        </div>
      )}

      {/* Category emoji - centered at top */}
      <div className="flex justify-center mb-2">
        <span className="text-3xl" role="img" aria-label={food.category}>
          {categoryEmoji}
        </span>
      </div>

      {/* Food name - Vietnamese name, truncated if too long */}
      <p
        className={cn(
          'text-body text-foreground font-medium',
          'text-center line-clamp-2',
          'mb-1'
        )}
      >
        {food.name_vi}
      </p>

      {/* Calories - smaller text, muted color */}
      <p className="text-caption text-foreground-muted text-center">
        {displayKcal} kcal
      </p>
    </Card>
  )
}
