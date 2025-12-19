/**
 * PortionPicker - Bottom sheet overlay for selecting portion size.
 * Shows S/M/L pill buttons with calorie info for the selected food.
 * Closes on backdrop tap or portion selection.
 * Includes heart icon button to toggle favorite status.
 *
 * Refactored to use BottomSheet primitive for consistent modal behavior,
 * accessibility (focus trap, ARIA), and responsive design (mobile drawer vs desktop modal).
 */

import { useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/common'
import type { FoodItem, PortionSize } from '@/types'

interface PortionPickerProps {
  food: FoodItem | null
  isOpen: boolean
  onSelect: (portion: PortionSize) => void
  onClose: () => void
  /** Whether the current food is in user's favorites */
  isFavorite?: boolean
  /** Callback when user taps the heart icon to toggle favorite */
  onToggleFavorite?: (food: FoodItem) => void
}

// Portion size labels and multiplier descriptions
const PORTION_OPTIONS: { size: PortionSize; label: string; description: string }[] = [
  { size: 'S', label: 'S', description: 'Small' },
  { size: 'M', label: 'M', description: 'Medium' },
  { size: 'L', label: 'L', description: 'Large' },
]

export function PortionPicker({
  food,
  isOpen,
  onSelect,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: PortionPickerProps) {
  // Handle portion selection: close sheet and notify parent
  const handlePortionSelect = useCallback(
    (portion: PortionSize) => {
      onSelect(portion)
      // Note: BottomSheet handles closing via onClose, but we call it explicitly
      // to ensure sheet closes immediately after selection
      onClose()
    },
    [onSelect, onClose]
  )

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(() => {
    if (food && onToggleFavorite) {
      onToggleFavorite(food)
    }
  }, [food, onToggleFavorite])

  // Don't render if closed or no food selected
  if (!isOpen || !food) return null

  // Custom title with heart icon
  const titleWithHeart = (
    <span className="inline-flex items-center justify-center gap-2">
      {food.name_vi}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={cn(
            'inline-flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'transition-all duration-150',
            'hover:bg-gray-100 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
        >
          <Heart
            size={20}
            className={cn(
              'transition-colors duration-150',
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'fill-none text-foreground-muted'
            )}
          />
        </button>
      )}
    </span>
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={titleWithHeart}
      description={`Select portion size for ${food.name_vi}`}
      size="auto"
      showDragHandle={true}
    >
      {/* Portion size pills - padding accommodates focus ring */}
      <div className="flex gap-3 justify-center p-1">
        {PORTION_OPTIONS.map(({ size, label }) => {
          const nutrition = food.portions[size]
          
          return (
            <button
              key={size}
              type="button"
              onClick={() => handlePortionSelect(size)}
              className={cn(
                // Pill base: rounded, generous padding for touch
                'flex-1 max-w-[140px] py-4 px-4',
                'rounded-pill bg-primary text-primary-foreground',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                // Hover/active states
                'hover:bg-primary-dark active:scale-95',
                // Touch target compliance
                'min-h-[72px] tap-highlight-none'
              )}
            >
              {/* Size label - large and prominent */}
              <span className="block text-xl font-bold mb-1">
                {label}
              </span>
              {/* Calorie info - smaller caption */}
              <span className="block text-caption opacity-90">
                {nutrition.kcal} kcal
              </span>
            </button>
          )
        })}
      </div>

      {/* Serving size hint */}
      <p className="text-caption text-foreground-muted text-center mt-4">
        {food.serving}
      </p>
    </BottomSheet>
  )
}
