/**
 * TimelineSection - Visual timeline with horizontal tab navigation.
 * Displays recent meals filtered by selected date tab (Today, Yesterday, weekdays, Older).
 * Features vertical timeline line with soft dot markers for each card.
 */

import { useEffect } from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineTabs } from './TimelineTabs'
import { TimelineCard } from './TimelineCard'
import { Card } from '@/components/common'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { LogEntry } from '@/types'

interface TimelineSectionProps {
  onLogAgain: (log: LogEntry) => void
}

/**
 * Timeline section with tab-based date filtering and visual timeline.
 * Tabs allow quick switching between days; cards show meals for selected day.
 */
export function TimelineSection({ onLogAgain }: TimelineSectionProps) {
  const { tabs, selectedTab, setSelectedTab, logs, isLoading, error, refresh } =
    useTimeline(7)

  // Track section visibility on mount
  useEffect(() => {
    if (!isLoading) {
      trackEvent('quickadd_section_visible', {
        section: 'timeline',
      })
    }
  }, [isLoading])

  // Section header (always visible)
  const sectionHeader = (
    <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
      <span>🕐</span> Recent
    </h2>
  )

  // Error state: query failure
  if (error) {
    return (
      <section className="mb-8">
        {sectionHeader}
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

  // Loading state: skeleton tabs and cards
  if (isLoading) {
    return (
      <section className="mb-8">
        {sectionHeader}
        {/* Skeleton tabs */}
        <div className="flex gap-2 mb-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-20 bg-gray-20 rounded-pill"
              aria-hidden="true"
            />
          ))}
        </div>
        {/* Skeleton cards */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="default" className="min-h-[72px]">
              <span className="sr-only">Loading...</span>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      {sectionHeader}

      {/* Horizontal tab navigation */}
      <TimelineTabs
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
      />

      {/* Timeline content with visual line and dots */}
      <div
        id={`timeline-panel-${selectedTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${selectedTab}`}
        className="mt-4"
      >
        {logs.length === 0 ? (
          // Empty state for selected tab
          <Card variant="default" className="text-center py-8">
            <p className="text-body text-foreground-muted">
              No meals logged{' '}
              {selectedTab === 'today'
                ? 'today'
                : selectedTab === 'yesterday'
                  ? 'yesterday'
                  : selectedTab === 'older'
                    ? 'before this week'
                    : 'on this day'}
            </p>
          </Card>
        ) : (
          // Visual timeline with dots and cards
          <div className="relative">
            {/* Vertical timeline line */}
            <div
              className={cn(
                'absolute left-3 top-4 bottom-4',
                'w-0.5 bg-gray-20',
                'rounded-full'
              )}
              aria-hidden="true"
            />

            {/* Timeline cards with dot markers */}
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-1.5 top-5',
                      'w-3 h-3 rounded-full',
                      'bg-gray-40 border-2 border-background',
                      'z-10'
                    )}
                    aria-hidden="true"
                  />

                  {/* Card offset from timeline */}
                  <div className="ml-8 flex-1">
                    <TimelineCard log={log} onLogAgain={onLogAgain} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
