/**
 * FavoriteCard - Grid card component for favorite foods.
 * Displays food with category icon, name, usage count, and heart icon to remove.
 * Optimized for grid layout with responsive design and compact height.
 */

import { useCallback } from 'react'
import { Heart } from 'lucide-react'
import { Card, IconButton, EmojiContainer } from '@/components/common'
import { cn } from '@/lib/utils'
import { getFoodEmoji } from '@/lib/food-emoji'
import type { FoodItem } from '@/types'

interface FavoriteCardProps {
  food: FoodItem
  useCount: number
  onSelect: (food: FoodItem) => void
  onRemove?: (food: FoodItem) => void
  disabled?: boolean
}

/**
 * Favorite card component for grid display.
 * Shows category icon, food name, logged count summary, and heart icon to remove.
 */
export function FavoriteCard({
  food,
  useCount,
  onSelect,
  onRemove,
  disabled = false,
}: FavoriteCardProps) {
  // Handle card click: opens portion picker for quick logging.
  const handleCardClick = useCallback(() => {
    if (!disabled) {
      onSelect(food)
    }
  }, [disabled, food, onSelect])

  // Handle heart icon click: removes food from favorites without opening the picker.
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled && onRemove) {
        onRemove(food)
      }
    },
    [disabled, food, onRemove]
  )

  const categoryEmoji = getFoodEmoji(food)
  const hasUsage = useCount > 0
  const usageLabel = hasUsage
    ? `Logged ${useCount} ${useCount === 1 ? 'time' : 'times'}`
    : null

  return (
    <Card
      variant="interactive"
      onPress={handleCardClick}
      disabled={disabled}
      className={cn(
        // Favorites quick-add cards should feel like a single horizontal scan line:
        // emoji container, label block, and heart affordance live on one row.
        'flex items-center justify-between',
        'p-3 min-h-[90px]'
      )}
    >
      {/* Left side: emoji container and text block (name + logged summary). */}
      <div className="flex items-center gap-3 min-w-0">
        <EmojiContainer emoji={categoryEmoji} ariaLabel={food.category} size="md" />
        <div className="flex flex-col min-w-0">
          <p
            className={cn(
              // Food name stays the primary anchor; truncate to keep layout stable on small screens.
              'text-title text-foreground font-medium',
              'truncate'
            )}
          >
            {food.name_vi}
          </p>
          {usageLabel && (
            <p
              className={cn(
                // Logged summary explains why this quick-add is useful,
                // using a softer style so it does not compete with the title.
                'text-body text-foreground-muted',
                'truncate'
              )}
            >
              {usageLabel}
            </p>
          )}
        </div>
      </div>

      {/* Right side: heart toggle only, acting as a clear favorite affordance. */}
      {onRemove && (
        <IconButton
          icon={<Heart size={16} className="fill-current" />}
          onClick={handleRemove}
          aria-label={`Remove ${food.name_vi} from favorites`}
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-orange-60 hover:text-orange-70"
        />
      )}
    </Card>
  )
}
