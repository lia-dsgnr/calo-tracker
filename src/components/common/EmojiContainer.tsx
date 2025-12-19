/**
 * EmojiContainer - Shared container for food emojis.
 * Wraps emojis in a soft rounded square so food items feel consistent across the app.
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface EmojiContainerProps {
  /** Emoji character to display (e.g., "🍚") */
  emoji: string
  /** Accessible label for screen readers; omit when decorative. */
  ariaLabel?: string
  /** Size preset controlling container and emoji scale. */
  size?: 'sm' | 'md' | 'lg'
  /** Optional additional classes for layout overrides. */
  className?: string
}

const sizeClasses: Record<NonNullable<EmojiContainerProps['size']>, string> = {
  sm: 'w-9 h-9 text-lg',
  md: 'w-11 h-11 text-xl',
  lg: 'w-14 h-14 text-2xl',
}

/**
 * Shared emoji container used by favorites, suggestions, timeline, and tiles.
 * Keeps food visuals aligned with the design reference without duplicating layout styles.
 */
export function EmojiContainer({
  emoji,
  ariaLabel,
  size = 'md',
  className,
}: EmojiContainerProps) {
  const role = ariaLabel ? 'img' : 'presentation'
  const ariaHidden = ariaLabel ? undefined : true

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl bg-brown-10 shrink-0',
        sizeClasses[size],
        className
      )}
      role={role}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      {emoji}
    </div>
  )
}
