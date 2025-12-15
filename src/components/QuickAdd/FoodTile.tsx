/**
 * FoodTile - Tappable card for selecting a food item.
 * Displays Vietnamese name and M-portion calories with add icon and optional favorite heart.
 * Used in both Recent Items and full food grid sections.
 */

import { useState, useCallback, useRef } from 'react'
import { PlusCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodItem } from '@/types'
import type { FoodType } from '@/db/types'

// Debounce delay for heart toggle to prevent rapid taps (FR-006.4)
const HEART_DEBOUNCE_MS = 300

interface FoodTileProps {
  food: FoodItem
  onSelect: (food: FoodItem) => void
  disabled?: boolean
  /** Whether this food is currently favorited */
  isFavorited?: boolean
  /** Callback when heart icon is clicked */
  onFavoriteToggle?: (food: FoodItem, foodType: FoodType) => void
  /** Food type: 'system' or 'custom' - determines favorite lookup */
  foodType?: FoodType
  /** Optional source badge text (e.g., "Custom", "Manual") */
  sourceBadge?: string
}

export function FoodTile({
  food,
  onSelect,
  disabled = false,
  isFavorited = false,
  onFavoriteToggle,
  foodType = 'system',
  sourceBadge,
}: FoodTileProps) {
  // Track pressed state for visual feedback on touch
  const [isPressed, setIsPressed] = useState(false)

  // Debounce ref for heart toggle
  const lastHeartTapRef = useRef<number>(0)

  const handleTouchStart = useCallback(() => {
    if (!disabled) setIsPressed(true)
  }, [disabled])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(food)
    }
  }, [disabled, food, onSelect])

  /**
   * Handle heart icon click with debouncing to prevent flicker.
   */
  const handleHeartClick = useCallback(
    (event: React.MouseEvent) => {
      // Stop propagation to prevent triggering tile selection
      event.stopPropagation()

      if (disabled || !onFavoriteToggle) return

      // Debounce rapid taps
      const now = Date.now()
      if (now - lastHeartTapRef.current < HEART_DEBOUNCE_MS) {
        return
      }
      lastHeartTapRef.current = now

      onFavoriteToggle(food, foodType)
    },
    [disabled, food, foodType, onFavoriteToggle]
  )

  // M portion is the default display value per spec
  const displayKcal = food.portions.M.kcal

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      disabled={disabled}
      className={cn(
        // Base card styling: white background, rounded corners, soft shadow
        'w-full bg-background-card rounded-card shadow-tile',
        'p-4 text-left transition-all duration-150',
        // Touch target minimum 44px (enforced via padding + content)
        'min-h-[72px] tap-highlight-none',
        // Focus state for accessibility
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Pressed state: slight scale down and shadow reduction
        isPressed && !disabled && 'scale-[0.97] shadow-none',
        // Disabled state: reduced opacity, no pointer events
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Vietnamese food name - primary text */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-body text-foreground font-medium leading-tight line-clamp-2">
              {food.name_vi}
            </p>
            {/* Source badge if provided */}
            {sourceBadge && (
              <span className="inline-flex px-1.5 py-0.5 rounded-chip bg-purple-20 text-purple-70 text-xs shrink-0">
                {sourceBadge}
              </span>
            )}
          </div>

          {/* Calorie display - muted caption showing M portion */}
          <p className="text-caption text-foreground-muted">
            {displayKcal} kcal
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Favorite heart icon */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={handleHeartClick}
              className={cn(
                'p-1.5 rounded-full',
                'flex items-center justify-center',
                'hover:bg-gray-20',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
              )}
              aria-label={
                isFavorited
                  ? `Remove ${food.name_vi} from favorites`
                  : `Add ${food.name_vi} to favorites`
              }
              disabled={disabled}
            >
              <Heart
                size={18}
                className={cn(
                  'transition-all duration-150',
                  isFavorited
                    ? 'fill-secondary text-secondary'
                    : 'text-foreground-muted'
                )}
              />
            </button>
          )}

          {/* Add icon for clarity */}
          <PlusCircle size={20} className="text-primary mt-0.5" />
        </div>
      </div>
    </button>
  )
}
