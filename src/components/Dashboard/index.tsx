/**
 * Dashboard - Main container for daily progress and meal history.
 * Combines DailySummary (ring + bar) with MealList.
 * Consumes data from useCaloStorage hook.
 */

import { DailySummary } from './DailySummary'
import { MealList } from './MealList'
import { cn } from '@/lib/utils'
import type { DailySummary as DailySummaryType, DailyGoals } from '@/types'

interface DashboardProps {
  dailySummary: DailySummaryType
  goals: DailyGoals
  onDeleteLog: (entryId: string) => void
  className?: string
}

export function Dashboard({ dailySummary, goals, onDeleteLog, className }: DashboardProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Progress section: calorie ring + protein bar */}
      <DailySummary
        summary={dailySummary}
        goals={goals}
      />

      {/* Meal history: chronological list of today's logs */}
      <MealList
        logs={dailySummary.logs}
        onDeleteLog={onDeleteLog}
      />
    </div>
  )
}

// Re-export sub-components for granular usage if needed
export { DailySummary } from './DailySummary'
export { MealList } from './MealList'
export { MealCard } from './MealCard'
export { ProgressRing } from './ProgressRing'
export { ProteinBar } from './ProteinBar'
export { CarbsBar } from './CarbsBar'
export { FatBar } from './FatBar'
export { MacroBar } from './MacroBar'
