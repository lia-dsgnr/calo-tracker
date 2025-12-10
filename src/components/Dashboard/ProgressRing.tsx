/**
 * ProgressRing - Animated circular progress indicator for daily calorie goal.
 * SVG-based ring that fills from 0 to current progress in 700ms.
 * Displays consumed/goal kcal in center with friendly, non-judgmental styling.
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  consumed: number
  goal: number
  className?: string
}

// SVG geometry constants for the ring
const RING_SIZE = 160
const STROKE_WIDTH = 12
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ProgressRing({ consumed, goal, className }: ProgressRingProps) {
  // Animate from 0 on mount for smooth entry
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Calculate progress percentage, capped at 100% for ring display
  const progress = Math.min(consumed / goal, 1)
  const isExceeded = consumed > goal

  // Trigger animation after mount
  useEffect(() => {
    // Small delay ensures CSS transition catches the change
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 50)
    return () => clearTimeout(timer)
  }, [progress])

  // Calculate stroke offset (full circumference = 0%, 0 = 100%)
  const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="transform -rotate-90"
      >
        {/* Background ring - subtle border color */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-border"
        />
        
        {/* Progress ring - primary green, animates via CSS transition */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-[stroke-dashoffset] duration-700 ease-out',
            // Use primary color always - no red for exceeded per design spec
            'text-primary'
          )}
        />
      </svg>

      {/* Center content: consumed kcal and label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-headline text-foreground">
          {consumed.toLocaleString('vi-VN')}
        </span>
        <span className="text-caption text-foreground-muted">
          {isExceeded ? (
            // Show excess in neutral color (not red per spec)
            <span>+{(consumed - goal).toLocaleString('vi-VN')} kcal</span>
          ) : (
            <span>/ {goal.toLocaleString('vi-VN')} kcal</span>
          )}
        </span>
      </div>
    </div>
  )
}
