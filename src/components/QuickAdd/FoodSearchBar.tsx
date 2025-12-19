/**
 * FoodSearchBar - Search bar wrapper for food search.
 * Composes SearchInput with food-specific placeholder.
 * Auto-focuses on mount for immediate search entry.
 */

import { useRef, useEffect, useCallback } from 'react'
import { SearchInput } from '@/components/common'
import { cn } from '@/lib/utils'

interface FoodSearchBarProps {
  /** Current search query */
  value: string
  /** Callback when query changes */
  onChange: (value: string) => void
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Food search bar with auto-focus.
 * Designed for inline placement alongside section headers.
 */
export function FoodSearchBar({
  value,
  onChange,
  autoFocus = true,
  className,
}: FoodSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount if enabled
  useEffect(() => {
    if (autoFocus) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus])

  // Handle clear from SearchInput - keep focus so user can continue typing
  const handleClear = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <SearchInput
      ref={inputRef}
      value={value}
      onChange={onChange}
      placeholder="Search food (e.g. chicken rice)"
      autoFocus={autoFocus}
      onClear={handleClear}
      aria-label="Search for food"
      className={cn('flex-1', className)}
    />
  )
}
