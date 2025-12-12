/**
 * CarbsBar - Horizontal progress bar for daily carbohydrate intake.
 * Shows consumed vs goal with rounded ends and yellow gradient fill.
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CarbsBarProps {
  consumed: number
  goal: number
  className?: string
}

export function CarbsBar({ consumed, goal, className }: CarbsBarProps) {
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
      {/* Label row: "Carbs" on left, consumed/goal on right */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-body text-foreground font-medium">Carbs</span>
        <span className="text-caption text-foreground-muted">
          {Math.round(consumed)}g / {goal}g
          {isExceeded && (
            <span className="ml-1">(+{Math.round(consumed - goal)}g)</span>
          )}
        </span>
      </div>

      {/* Progress bar container */}
      <div className="h-3 bg-border rounded-pill overflow-hidden">
        {/* Filled portion with yellow gradient (Zen Yellow) */}
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-700 ease-out',
            'bg-gradient-to-r from-yellow-60 to-yellow-50'
          )}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  )
}

