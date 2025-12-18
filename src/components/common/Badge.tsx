/**
 * Badge - Small chip component for metadata display.
 * Provides consistent styling for counts, labels, and status indicators.
 * Used by: "Logged 12x" badges, portion sizes, source labels.
 */

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'muted'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  /** Badge content (text, number, etc.) */
  children: React.ReactNode
  /** Visual variant */
  variant?: BadgeVariant
  /** Size variant */
  size?: BadgeSize
  /** Additional CSS classes */
  className?: string
}

// Variant styles mapping
const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-20 text-foreground',
  primary: 'bg-primary/20 text-primary',
  muted: 'bg-gray-10 text-foreground-muted',
}

// Size styles mapping
const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-caption',
  md: 'px-3 py-1 text-body',
}

/**
 * Badge component for displaying small pieces of metadata.
 * Supports multiple variants and sizes for different contexts.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styling: rounded pill shape
        'inline-flex items-center justify-center',
        'rounded-full font-medium',
        'whitespace-nowrap',
        // Variant and size styles
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
    >
      {children}
    </span>
  )
}
