/**
 * TimelineCard - Expandable card for a logged meal entry.
 * Shows food name, portion, kcal, and time logged.
 * Expands to show macros breakdown and Delete button.
 * Includes "Log Again" action to re-log the same meal.
 * 
 * Uses Card component with expandable variant for collapsible content.
 */

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Card, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { LogEntry } from '@/types'

interface TimelineCardProps {
  log: LogEntry
  onLogAgain: (log: LogEntry) => void
  onDelete: (logId: string) => void
}

/**
 * Timeline card component with expand/collapse functionality.
 * Tap card body to expand; shows macros breakdown and delete option when expanded.
 */
export function TimelineCard({ log, onLogAgain, onDelete }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Toggle expanded state
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  // Handle "Log Again" action: opens portion picker with same portion
  const handleLogAgain = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onLogAgain(log)
    },
    [log, onLogAgain]
  )

  // Handle delete action: soft deletes the log entry
  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onDelete(log.id)
      setIsExpanded(false)
    },
    [log.id, onDelete]
  )

  // Format timestamp to time (e.g., "10:30 AM")
  const timeLabel = format(new Date(log.timestamp), 'h:mm a')

  return (
    <Card
      variant="expandable"
      isExpanded={isExpanded}
      onPress={handleToggle}
      className={cn('mb-3')}
    >
      {/* Main content - always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Food name and portion */}
          <p className="text-body text-foreground font-medium">
            {log.name_vi} ({log.portion})
          </p>

          {/* Calorie and time info */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-caption text-foreground-muted">
              {log.kcal} kcal
            </span>
            <span className="text-caption text-foreground-muted">•</span>
            <span className="text-caption text-foreground-muted">{timeLabel}</span>
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp size={20} className="text-foreground-muted" />
          ) : (
            <ChevronDown size={20} className="text-foreground-muted" />
          )}
        </div>
      </div>

      {/* Expanded content - macros breakdown and actions */}
      {isExpanded && (
        <div
          className={cn(
            'mt-4 pt-4 border-t border-border',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          {/* Macros breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-caption text-foreground-muted">Protein</p>
              <p className="text-body text-foreground font-medium">
                {log.protein}g
              </p>
            </div>
            <div>
              <p className="text-caption text-foreground-muted">Carbs</p>
              <p className="text-body text-foreground font-medium">
                {log.carbs}g
              </p>
            </div>
            <div>
              <p className="text-caption text-foreground-muted">Fat</p>
              <p className="text-body text-foreground font-medium">{log.fat}g</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogAgain}
              className={cn(
                'flex-1 px-4 py-2',
                'bg-primary text-primary-foreground rounded-pill',
                'text-caption font-medium',
                'hover:bg-primary-dark active:scale-95',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            >
              Log Again
            </button>
            <IconButton
              icon={<Trash2 size={18} />}
              onClick={handleDelete}
              aria-label={`Delete ${log.name_vi}`}
              variant="danger"
              size="md"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
