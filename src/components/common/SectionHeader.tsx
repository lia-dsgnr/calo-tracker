/**
 * SectionHeader - Section divider with icon and label.
 * Provides consistent styling for grouped content headers.
 * Used by: FoodSearchResults groups, FavoritesGrid, any sectioned list.
 */

import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Icon element or emoji string */
  icon?: React.ReactNode | string
  /** Section label text */
  label: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Section header with optional icon and label.
 * Soft styling for visual grouping without heavy dividers.
 */
export function SectionHeader({ icon, label, className }: SectionHeaderProps) {
  // Determine if icon is a string (emoji) or ReactNode
  const iconContent =
    typeof icon === 'string' ? (
      <span role="img" aria-hidden="true">
        {icon}
      </span>
    ) : (
      icon
    )

  return (
    <div
      className={cn(
        // Layout: horizontal flex with gap
        'flex items-center gap-2',
        // Spacing: vertical margin for separation
        'py-2',
        className
      )}
    >
      {/* Icon slot */}
      {iconContent && (
        <span className="text-foreground-muted shrink-0">{iconContent}</span>
      )}

      {/* Label */}
      <span className="text-body font-semibold text-foreground">{label}</span>
    </div>
  )
}
