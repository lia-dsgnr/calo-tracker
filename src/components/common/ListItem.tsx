/**
 * ListItem - Flexible row component for list displays.
 * Provides consistent layout: left slot (emoji/thumbnail) + content (title/subtitle) + right slot.
 * Used by: FoodSearchResultItem, TimelineCard, MealCard, and other list-based UIs.
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ListItemProps {
  /** Left slot content: emoji, thumbnail, or icon */
  leftSlot?: React.ReactNode
  /** Primary text (food name, title) */
  title: React.ReactNode
  /** Secondary text (subtitle, metadata) */
  subtitle?: React.ReactNode
  /** Right slot content: badge, action button, or metadata */
  rightSlot?: React.ReactNode
  /** Click handler - makes the item interactive */
  onClick?: () => void
  /** Disable interactions */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * List item with flexible slots for content.
 * Supports interactive (clickable) and static variants.
 */
export function ListItem({
  leftSlot,
  title,
  subtitle,
  rightSlot,
  onClick,
  disabled = false,
  className,
}: ListItemProps) {
  const isInteractive = !!onClick && !disabled

  // Handle click with keyboard support
  const handleClick = useCallback(() => {
    if (isInteractive && onClick) {
      onClick()
    }
  }, [isInteractive, onClick])

  // Handle keyboard activation (Enter/Space)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick?.()
      }
    },
    [isInteractive, onClick]
  )

  return (
    <div
      className={cn(
        // Base layout: horizontal flex with gap
        'flex items-center gap-3',
        // Padding for touch targets
        'px-4 py-3',
        // Background
        'bg-background-card rounded-card',
        // Interactive states - use brown-10 for warmer hover that stands out from gray background
        isInteractive && [
          'cursor-pointer',
          'hover:bg-brown-10 active:bg-brown-20',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
        ],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled}
    >
      {/* Left slot: emoji, thumbnail, or icon */}
      {leftSlot && (
        <div className="shrink-0" aria-hidden="true">
          {leftSlot}
        </div>
      )}

      {/* Content: title and optional subtitle */}
      <div className="flex-1 min-w-0">
        <div className="text-body text-foreground font-medium truncate">
          {title}
        </div>
        {subtitle && (
          <div className="text-caption text-foreground-muted truncate">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right slot: badge, action, or metadata */}
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  )
}
