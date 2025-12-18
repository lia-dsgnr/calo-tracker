/**
 * IconButton - Icon-only button component for consistent icon button patterns.
 * 
 * Consolidates icon button usage across the app (Toast close, MealCard delete,
 * Quick-log icon, Favorite heart toggle, etc.). Ensures consistent sizing,
 * accessibility, and interaction states.
 * 
 * Used by: Toast, MealCard, FavoriteTile, and other components needing icon buttons
 */

import { cn } from '@/lib/utils'

interface IconButtonProps {
  /** Icon element (from lucide-react or custom SVG) */
  icon: React.ReactNode
  /** Click handler */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Required ARIA label for accessibility (screen readers) */
  'aria-label': string
  /** Visual variant: default, primary, danger, ghost */
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  /** Size: sm (32px), md (40px), lg (48px) */
  size?: 'sm' | 'md' | 'lg'
  /** Disable button */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Icon-only button component with consistent sizing and variants.
 * Ensures minimum 44x44px touch target for accessibility.
 */
export function IconButton({
  icon,
  onClick,
  'aria-label': ariaLabel,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: IconButtonProps) {
  // Size mappings: icon size and container padding
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5', // 32px container, ~20px icon
    md: 'w-10 h-10 p-2', // 40px container, ~24px icon
    lg: 'w-12 h-12 p-2.5', // 48px container, ~28px icon
  }

  // Variant-specific styling
  const variantClasses = {
    default: [
      // Neutral: subtle background on hover
      'text-foreground-muted',
      'hover:bg-gray-20 hover:text-foreground',
      'active:bg-gray-30',
    ],
    primary: [
      // Primary: uses primary color
      'text-primary',
      'hover:bg-primary/10 hover:text-primary-dark',
      'active:bg-primary/20',
    ],
    danger: [
      // Danger: uses error/warning color
      'text-error',
      'hover:bg-error/10 hover:text-error',
      'active:bg-error/20',
    ],
    ghost: [
      // Ghost: no background, only text color change
      'text-foreground-muted',
      'hover:text-foreground',
      'active:opacity-70',
    ],
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Base: rounded, flex centering, transitions
        'rounded-full',
        'flex items-center justify-center',
        'transition-all duration-150',
        // Size
        sizeClasses[size],
        // Variant styles
        variantClasses[variant],
        // Focus: visible ring for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Touch target: ensure minimum 44x44px (handled by size, but explicit for safety)
        'min-h-[44px] min-w-[44px]',
        // Remove tap highlight on mobile
        'tap-highlight-none',
        // Custom classes
        className
      )}
    >
      {icon}
    </button>
  )
}
