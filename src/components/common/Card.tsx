/**
 * Card - Base card component with variants for different use cases.
 * 
 * Provides consistent card styling across the app with three variants:
 * - default: Static card with background and shadow
 * - interactive: Clickable card with hover/active states
 * - expandable: Card that can expand/collapse to show additional content
 * 
 * Used by: FavoriteTile, TimelineCard, TemplateCard, and other card-based components
 */

import { cn } from '@/lib/utils'

interface CardProps {
  /** Card content */
  children: React.ReactNode
  /** Visual variant: default (static), interactive (clickable), expandable (collapsible) */
  variant?: 'default' | 'interactive' | 'expandable'
  /** For expandable variant: whether card is currently expanded */
  isExpanded?: boolean
  /** Click handler for interactive/expandable variants */
  onPress?: () => void
  /** Disable interactions */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Base card component with design system styling.
 * Supports three interaction patterns: static, clickable, and expandable.
 */
export function Card({
  children,
  variant = 'default',
  isExpanded = false,
  onPress,
  disabled = false,
  className,
}: CardProps) {
  const isInteractive = variant === 'interactive' || variant === 'expandable'
  const isClickable = isInteractive && !disabled && onPress

  const handleClick = () => {
    if (isClickable && onPress) {
      onPress()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard accessibility: Enter or Space activates clickable cards
    if (isClickable && (e.key === 'Enter' || e.key === ' ') && onPress) {
      e.preventDefault()
      onPress()
    }
  }

  return (
    <div
      className={cn(
        // Base card styling: background, border radius, shadow
        'bg-background-card rounded-card shadow-card',
        // Padding for content
        'p-4',
        // Variant-specific styles
        variant === 'interactive' && isClickable && [
          // Interactive states: hover elevation, active scale, cursor pointer
          'hover:shadow-md transition-shadow duration-150',
          'active:scale-[0.98] transition-transform duration-100',
          'cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        ],
        variant === 'expandable' && isClickable && [
          // Expandable: same interactive styles plus transition for expansion
          'hover:shadow-md transition-all duration-150',
          'active:scale-[0.98] transition-transform duration-100',
          'cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        ],
        // Disabled state: reduced opacity, no pointer events
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Custom classes
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-expanded={variant === 'expandable' ? isExpanded : undefined}
      aria-disabled={disabled}
    >
      {children}
    </div>
  )
}
