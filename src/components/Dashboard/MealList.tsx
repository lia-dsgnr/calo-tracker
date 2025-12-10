/**
 * MealList - Chronological list of today's logged meals.
 * Displays newest first, collapses after 6 items with expand toggle.
 * Each meal card supports deletion via MealCard component.
 */

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MealCard } from './MealCard'
import { cn } from '@/lib/utils'
import type { LogEntry } from '@/types'

interface MealListProps {
  logs: LogEntry[]
  onDeleteLog: (entryId: string) => void
  className?: string
}

// Number of items to show before collapsing
const COLLAPSE_THRESHOLD = 6

export function MealList({ logs, onDeleteLog, className }: MealListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Sort logs newest first for chronological display
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.timestamp - a.timestamp),
    [logs]
  )

  // Determine if we need collapse functionality
  const needsCollapse = sortedLogs.length > COLLAPSE_THRESHOLD
  const visibleLogs = needsCollapse && !isExpanded
    ? sortedLogs.slice(0, COLLAPSE_THRESHOLD)
    : sortedLogs
  const hiddenCount = sortedLogs.length - COLLAPSE_THRESHOLD

  // Don't render anything if no logs
  if (logs.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section header */}
      <h2 className="text-title text-foreground px-1">
        Today's Meals
      </h2>

      {/* Meal cards list */}
      <div className="space-y-2">
        {visibleLogs.map((entry) => (
          <MealCard
            key={entry.id}
            entry={entry}
            onDelete={onDeleteLog}
          />
        ))}
      </div>

      {/* Expand/collapse toggle when needed */}
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full py-3 flex items-center justify-center gap-2',
            'text-body text-primary font-medium',
            'rounded-card hover:bg-primary/5 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'tap-highlight-none'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={18} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              Show {hiddenCount} more
            </>
          )}
        </button>
      )}
    </div>
  )
}
