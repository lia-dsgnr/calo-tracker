/**
 * PortionPicker - Bottom sheet overlay for selecting portion size.
 * Shows S/M/L pill buttons with calorie info for the selected food.
 * Closes on backdrop tap or portion selection.
 */

import { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { FoodItem, PortionSize } from '@/types'

interface PortionPickerProps {
  food: FoodItem | null
  isOpen: boolean
  onSelect: (portion: PortionSize) => void
  onClose: () => void
}

// Portion size labels and multiplier descriptions
const PORTION_OPTIONS: { size: PortionSize; label: string; description: string }[] = [
  { size: 'S', label: 'S', description: 'Small' },
  { size: 'M', label: 'M', description: 'Medium' },
  { size: 'L', label: 'L', description: 'Large' },
]

export function PortionPicker({ food, isOpen, onSelect, onClose }: PortionPickerProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleSheetClick = useCallback((e: React.MouseEvent) => {
    // Prevent backdrop click when clicking inside sheet
    e.stopPropagation()
  }, [])

  const handlePortionSelect = useCallback(
    (portion: PortionSize) => {
      onSelect(portion)
    },
    [onSelect]
  )

  if (!isOpen || !food) return null

  return (
    // Backdrop overlay - closes sheet on tap
    <div
      className="fixed inset-0 z-50 bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portion-picker-title"
    >
      {/* Bottom sheet container */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-background-card rounded-t-sheet shadow-sheet',
          'px-5 pt-6 pb-14 safe-bottom',
          'animate-slide-up'
        )}
        onClick={handleSheetClick}
      >
        {/* Drag handle indicator */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        {/* Food name header */}
        <h2
          id="portion-picker-title"
          className="text-title text-foreground text-center mb-6"
        >
          {food.name_vi}
        </h2>

        {/* Portion size pills */}
        <div className="flex gap-3 justify-center">
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
      </div>
    </div>
  )
}
