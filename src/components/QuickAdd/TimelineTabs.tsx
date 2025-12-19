/**
 * TimelineTabs - Horizontal scrollable tab bar for timeline date filtering.
 * Displays pill-shaped buttons for Today, Yesterday, weekdays, and Older.
 * Optimised for mobile with touch-friendly scrolling and hidden scrollbar.
 */

import { cn } from '@/lib/utils'
import type { TimelineTab } from '@/hooks/useTimeline'

interface TimelineTabsProps {
  tabs: TimelineTab[]
  selectedTab: string
  onSelectTab: (key: string) => void
}

/**
 * Horizontal tab bar with pill buttons for timeline navigation.
 * Active tab has dark fill; inactive tabs have subtle border.
 */
export function TimelineTabs({
  tabs,
  selectedTab,
  onSelectTab,
}: TimelineTabsProps) {
  return (
    <div
      className={cn(
        // Horizontal scroll container
        'flex gap-2 overflow-x-auto',
        // Hide scrollbar for cleaner mobile appearance
        'scrollbar-hide',
        // Padding to prevent focus ring from being clipped
        'p-1'
      )}
      role="tablist"
      aria-label="Timeline date filter"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === selectedTab

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`timeline-panel-${tab.key}`}
            onClick={() => onSelectTab(tab.key)}
            className={cn(
              // Base styling: pill shape, consistent sizing
              'px-4 py-2 rounded-pill',
              'text-caption font-medium',
              'whitespace-nowrap',
              'transition-all duration-150',
              // Touch target: minimum 44px height
              'min-h-[44px]',
              // Focus state for accessibility
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              // Active/inactive styling
              isActive
                ? // Active: dark fill matching mockup
                  'bg-brown-80 text-white'
                : // Inactive: subtle border, muted text
                  'bg-gray-10 text-foreground-muted border border-gray-20 hover:bg-gray-20'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
