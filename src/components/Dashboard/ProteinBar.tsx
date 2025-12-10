/**
 * ProteinBar - Horizontal progress bar for daily protein intake.
 * Shows consumed vs goal with rounded ends and soft gradient fill.
 * Complements the ProgressRing for a complete nutrition overview.
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProteinBarProps {
  consumed: number
  goal: number
  className?: string
}

export function ProteinBar({ consumed, goal, className }: ProteinBarProps) {
  // Animate from 0 on mount for smooth entry
  const [animatedWidth, setAnimatedWidth] = useState(0)

  // Calculate progress percentage, capped at 100% for bar display
  const progress = Math.min(consumed / goal, 1) * 100
  const isExceeded = consumed > goal

  // Trigger animation after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(progress)
    }, 50)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className={cn('w-full', className)}>
      {/* Label row: "Protein" on left, consumed/goal on right */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-body text-foreground font-medium">Protein</span>
        <span className="text-caption text-foreground-muted">
          {consumed}g / {goal}g
          {isExceeded && (
            // Show excess in neutral color (not red per design spec)
            <span className="ml-1">(+{consumed - goal}g)</span>
          )}
        </span>
      </div>

      {/* Progress bar container */}
      <div className="h-3 bg-border rounded-pill overflow-hidden">
        {/* Filled portion with gradient and animation */}
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-700 ease-out',
            // Soft gradient from primary to primary-light
            'bg-gradient-to-r from-primary to-primary-light'
          )}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  )
}
