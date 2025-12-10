/**
 * FoodTile - Tappable card for selecting a food item.
 * Displays Vietnamese name and M-portion calories with add icon.
 * Used in both Recent Items and full food grid sections.
 */

import { useState, useCallback } from 'react'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodItem } from '@/types'

interface FoodTileProps {
  food: FoodItem
  onSelect: (food: FoodItem) => void
  disabled?: boolean
}

export function FoodTile({ food, onSelect, disabled = false }: FoodTileProps) {
  // Track pressed state for visual feedback on touch
  const [isPressed, setIsPressed] = useState(false)

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
          <p className="text-body text-foreground font-medium leading-tight line-clamp-2">
            {food.name_vi}
          </p>
          
          {/* Calorie display - muted caption showing M portion */}
          <p className="text-caption text-foreground-muted mt-1">
            {displayKcal} kcal
          </p>
        </div>

        {/* Add icon for clarity */}
        <PlusCircle
          size={20}
          className="text-primary shrink-0 mt-0.5"
        />
      </div>
    </button>
  )
}
