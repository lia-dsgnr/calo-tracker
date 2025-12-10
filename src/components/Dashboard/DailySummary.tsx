/**
 * DailySummary - Main progress display combining calorie ring and macro bars.
 * Shows empty state when no meals logged today.
 * Positioned at top of dashboard as primary visual focus.
 */

import { ProgressRing } from './ProgressRing'
import { ProteinBar } from './ProteinBar'
import { CarbsBar } from './CarbsBar'
import { FatBar } from './FatBar'
import { cn } from '@/lib/utils'
import type { DailySummary as DailySummaryType, DailyGoals } from '@/types'

interface DailySummaryProps {
  summary: DailySummaryType
  goals: DailyGoals
  className?: string
}

export function DailySummary({ summary, goals, className }: DailySummaryProps) {
  const hasLogs = summary.logs.length > 0

  // Empty state when no meals logged today
  if (!hasLogs) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        {/* Simple emoji illustration - keeps bundle small vs SVG illustration */}
        <div className="text-6xl mb-4" role="img" aria-label="Bowl of food">
          🍜
        </div>
        <p className="text-body text-foreground-muted text-center">
          Hãy thêm món đầu tiên...
        </p>
        <p className="text-caption text-foreground-muted mt-1">
          Tap a food below to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Calorie progress ring - primary visual */}
      <ProgressRing
        consumed={summary.consumedKcal}
        goal={goals.dailyKcal}
        className="mb-6"
      />

      {/* Macronutrient bars - protein, carbs, fat */}
      <div className="w-full max-w-xs space-y-4">
        <ProteinBar
          consumed={summary.consumedProtein}
          goal={goals.dailyProtein}
        />
        <CarbsBar
          consumed={summary.consumedCarbs}
          goal={goals.dailyCarbs}
        />
        <FatBar
          consumed={summary.consumedFat}
          goal={goals.dailyFat}
        />
      </div>
    </div>
  )
}
