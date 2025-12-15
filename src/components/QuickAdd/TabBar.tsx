/**
 * TabBar - Tab navigation for QuickAdd screen.
 * Allows switching between All, Recent, and Favorites views.
 */

import { cn } from '@/lib/utils'

export type TabId = 'all' | 'recent' | 'favorites'

interface Tab {
  id: TabId
  label: string
  count?: number
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: TabId
  onTabChange: (tabId: TabId) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      className="flex border-b border-border"
      role="tablist"
      aria-label="Food categories"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 py-3 px-4',
            'text-body font-medium',
            'border-b-2 -mb-px',
            'transition-colors duration-150',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                'ml-1.5 text-caption',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-foreground-muted'
              )}
            >
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
