/**
 * TimelineSection - Section displaying recent meal logs grouped by date.
 * Shows logs in reverse chronological order with date headers.
 * Handles empty, loading, and error states.
 * 
 * Uses TimelineCard components for each log entry.
 */

import { useEffect } from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineCard } from './TimelineCard'
import { Card } from '@/components/common'
import { trackEvent } from '@/lib/analytics'
import type { LogEntry } from '@/types'

interface TimelineSectionProps {
  onLogAgain: (log: LogEntry) => void
  onDelete: (logId: string) => void
}

/**
 * Timeline section component with date-grouped logs.
 * Displays recent meals with expandable cards for details and actions.
 */
export function TimelineSection({
  onLogAgain,
  onDelete,
}: TimelineSectionProps) {
  const { groups, isLoading, error, refresh } = useTimeline(7)

  // Track section visibility on mount
  useEffect(() => {
    if (!isLoading) {
      trackEvent('quickadd_section_visible', {
        section: 'timeline',
      })
    }
  }, [isLoading])

  // Empty state: no logs in last 7 days
  if (!isLoading && !error && groups.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>🕐</span> Recent
        </h2>
        <Card variant="default" className="text-center py-8">
          <p className="text-body text-foreground-muted">
            Your recent meals will appear here
          </p>
        </Card>
      </section>
    )
  }

  // Error state: query failure
  if (error) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>🕐</span> Recent
        </h2>
        <Card variant="default" className="text-center py-8">
          <p className="text-body text-foreground-muted mb-4">
            Couldn't load history
          </p>
          <button
            onClick={refresh}
            className="text-primary hover:underline text-caption"
          >
            Retry
          </button>
        </Card>
      </section>
    )
  }

  // Loading state: skeleton cards
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>🕐</span> Recent
        </h2>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="default" className="min-h-[80px]">
              <span className="sr-only">Loading...</span>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  // Normal state: display timeline groups
  return (
    <section className="mb-8">
      <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
        <span>🕐</span> Recent
      </h2>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.date}>
            {/* Date section header */}
            <h3 className="text-subheadline text-foreground-muted mb-3">
              {group.dateLabel}
            </h3>

            {/* Log cards for this date */}
            <div className="space-y-3">
              {group.logs.map((log) => (
                <TimelineCard
                  key={log.id}
                  log={log}
                  onLogAgain={onLogAgain}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
