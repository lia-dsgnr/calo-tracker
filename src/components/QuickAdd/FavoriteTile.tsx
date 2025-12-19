/**
 * FavoriteTile - Compact interactive card for a favorite food item.
 * Displays food name with heart icon to remove and plus icon to log.
 * Tap tile body opens portion picker; tap plus icon logs immediately.
 */

import { useCallback } from 'react'
import { Plus, Heart } from 'lucide-react'
import { Card, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import type { FoodItem, PortionSize } from '@/types'

interface FavoriteTileProps {
  food: FoodItem
  defaultPortion: PortionSize
  onSelect: (food: FoodItem) => void
  onQuickLog: (food: FoodItem, portion: PortionSize) => void
  onRemove?: (food: FoodItem) => void
  disabled?: boolean
}

/**
 * Favorite tile component with remove and quick-log actions.
 * Heart icon removes from favorites; plus icon logs with default portion.
 */
export function FavoriteTile({
  food,
  defaultPortion,
  onSelect,
  onQuickLog,
  onRemove,
  disabled = false,
}: FavoriteTileProps) {
  // Handle tile body click: opens portion picker
  const handleTileClick = useCallback(() => {
    if (!disabled) {
      onSelect(food)
    }
  }, [disabled, food, onSelect])

  // Handle plus icon click: logs immediately with default portion
  const handleQuickLog = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled) {
        onQuickLog(food, defaultPortion)
      }
    },
    [disabled, food, defaultPortion, onQuickLog]
  )

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

  return (
    <Card
      variant="interactive"
      onPress={handleTileClick}
      disabled={disabled}
      className={cn(
        // Compact horizontal layout
        'flex flex-row items-center gap-2',
        'px-3 py-2',
        'min-h-[44px]'
      )}
    >
      {/* Heart icon - remove from favorites */}
      {onRemove && (
        <IconButton
          icon={<Heart size={14} className="fill-current" />}
          onClick={handleRemove}
          aria-label={`Remove ${food.name_vi} from favorites`}
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="shrink-0 -ml-1"
        />
      )}

      {/* Food name - Vietnamese name */}
      <span className="text-body text-foreground font-medium truncate flex-1">
        {food.name_vi}
      </span>

      {/* Plus icon - quick log */}
      <IconButton
        icon={<Plus size={16} />}
        onClick={handleQuickLog}
        aria-label={`Log ${food.name_vi}`}
        variant="primary"
        size="sm"
        disabled={disabled}
        className="shrink-0 -mr-1"
      />
    </Card>
  )
}


